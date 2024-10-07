package main

import (
	"bug-buster/shared"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"strconv"

	"github.com/ethereum/go-ethereum/common"
	"github.com/holiman/uint256"
	"github.com/rollmelette/rollmelette"
)

type BugBusterContract struct {
	state shared.BugBusterState
}

func (c *BugBusterContract) Advance(
	env rollmelette.Env,
	metadata rollmelette.Metadata,
	deposit rollmelette.Deposit,
	payload []byte,
) error {

	var input shared.Input
	err := json.Unmarshal(payload, &input)
	if err != nil {
		return fmt.Errorf("failed to unmarshal input: %w", err)
	}
	switch input.Kind {
	case shared.CreateAppBountyInputKind:
		var inputPayload shared.CreateAppBounty
		err = json.Unmarshal(input.Payload, &inputPayload)
		if err != nil {
			return fmt.Errorf("failed to unmarshal payload: %w", err)
		}

		// validate input
		if err := inputPayload.Validate(); err != nil {
			return err
		}

		// Check deadline
		currTime := metadata.BlockTimestamp
		if inputPayload.Deadline <= currTime {
			return fmt.Errorf("deadline already over")
		}

		// create new bounty
		bountyIndex := len(c.state.Bounties)

		// create bounty file
		if inputPayload.CodeZipBinary != nil {
			err := DecodeUnzipStore(bountyIndex, *inputPayload.CodeZipBinary)
			if err != nil {
				return err
			}
		} else if inputPayload.CodeZipPath != nil {
			err := LinkBounty(bountyIndex, *inputPayload.CodeZipPath)
			if err != nil {
				return err
			}
		} else {
			return fmt.Errorf("missing code binary and path")
		}

		// append bounty to array of bounties
		bounty := &shared.AppBounty{
			Name:         inputPayload.Name,
			ImgLink:      inputPayload.ImgLink,
			Description:  inputPayload.Description,
			Deadline:     inputPayload.Deadline,
			Token:        inputPayload.Token,
			Environment:  inputPayload.Environment,
			BountyType:   inputPayload.BountyType,
			Sponsorships: nil,
			Exploit:      nil,
			Withdrawn:    false,
		}
		c.state.Bounties = append(c.state.Bounties, bounty)

	case shared.AddSponsorshipInputKind:
		var inputPayload shared.AddSponsorship
		err = json.Unmarshal(input.Payload, &inputPayload)
		if err != nil {
			return fmt.Errorf("failed to unmarshal payload: %w", err)
		}

		// validate input
		if err := inputPayload.Validate(); err != nil {
			return err
		}

		// check if bounty exist
		bounty := c.state.GetBounty(inputPayload.BountyIndex)
		if bounty == nil {
			return fmt.Errorf("bounty not found")
		}

		// check exploit
		if bounty.Exploit != nil {
			return fmt.Errorf("can't add sponsorship because exploit was found")
		}

		// check bounty deadline
		currTime := metadata.BlockTimestamp
		if currTime >= bounty.Deadline {
			return fmt.Errorf("can't add sponsorship after deadline")
		}

		var erc20DepositSender common.Address
		var erc20DepositValue *uint256.Int

		switch deposit := deposit.(type) {
		case *rollmelette.ERC20Deposit:
			if deposit.Token != bounty.Token {
				return fmt.Errorf("wrong token: %v", bounty.Token)
			}
			erc20DepositSender = deposit.Sender
			erc20DepositValue, _ = uint256.FromBig(deposit.Amount)
		default:
			return fmt.Errorf("unsupported deposit: %T", deposit)
		}

		sponsorship := bounty.GetSponsorship(erc20DepositSender)
		if sponsorship != nil {
			// Add to existing sponsorship
			newValue := new(uint256.Int).Add(sponsorship.Value, erc20DepositValue)
			sponsorship.Value = newValue
			// Update profile
			sponsorship.Sponsor.Name = inputPayload.Name
			sponsorship.Sponsor.ImgLink = inputPayload.ImgLink
		} else {
			// Create new sponsorship
			sponsorship := &shared.Sponsorship{
				Sponsor: shared.Profile{
					Address: erc20DepositSender,
					Name:    inputPayload.Name,
					ImgLink: inputPayload.ImgLink,
				},
				Value: erc20DepositValue,
			}
			bounty.Sponsorships = append(bounty.Sponsorships, sponsorship)
		}

	case shared.WithdrawSponsorshipInputKind:
		var inputPayload shared.WithdrawSponsorship
		err = json.Unmarshal(input.Payload, &inputPayload)
		if err != nil {
			return fmt.Errorf("failed to unmarshal payload: %w", err)
		}

		// check if bounty exist
		bounty := c.state.GetBounty(inputPayload.BountyIndex)
		if bounty == nil {
			return fmt.Errorf("bounty not found")
		}

		// check exploit
		if bounty.Exploit != nil {
			return fmt.Errorf("can't withdraw because exploit was found")
		}

		// check bounty deadline
		currTime := metadata.BlockTimestamp
		if currTime < bounty.Deadline {
			return fmt.Errorf("can't withdraw before deadline")
		}

		// check if already withdrawn
		if bounty.Withdrawn {
			return fmt.Errorf("sponsorships already withdrawn")
		}

		// generate voucher for each sponsor
		for _, sponsorship := range bounty.Sponsorships {
			idx, err := env.ERC20Withdraw(bounty.Token, sponsorship.Sponsor.Address, sponsorship.Value.ToBig())
			if err != nil {
				return fmt.Errorf("failed to withdraw: %v", err)
			}
			slog.Debug("Idx for ERC20Withdraw:")
			slog.Debug(string(idx))
		}

		// set bounty as withdrawn
		bounty.Withdrawn = true

	case shared.SendExploitInputKind:
		var inputPayload shared.SendExploit
		err = json.Unmarshal(input.Payload, &inputPayload)
		if err != nil {
			return fmt.Errorf("failed to unmarshal payload: %w", err)
		}

		// validate input
		if err := inputPayload.Validate(); err != nil {

			return err
		}

		// check if bounty exist
		bounty := c.state.GetBounty(inputPayload.BountyIndex)

		if bounty == nil {
			return fmt.Errorf("bounty not found")
		}

		paid, _ := CheckOpenRLBounty(bounty, metadata.BlockTimestamp, env, c)
		if paid {
			break
		}

		// check exploit
		if bounty.Exploit != nil {
			return fmt.Errorf("can't send exploit because exploit was found")
		}

		// check bounty deadline
		currTime := metadata.BlockTimestamp
		if currTime >= bounty.Deadline {
			return fmt.Errorf("can't run exploit after deadline")
		}

		switch bounty.BountyType {
		case shared.BugBounty:

			// try to run exploit
			if err := RunExploit(env, inputPayload.BountyIndex, inputPayload.Exploit, false); err != nil {
				return err
			}

			hackerAddr := metadata.MsgSender

			if err := ExecutePayment(bounty, hackerAddr, env); err != nil {
				return err
			}

			// register exploit
			bounty.Exploit = &shared.Exploit{
				Hacker: shared.Profile{
					Address: hackerAddr,
					Name:    inputPayload.Name,
					ImgLink: inputPayload.ImgLink,
				},
				InputIndex: metadata.InputIndex,
			}

			// set bounty as withdrawn
			bounty.Withdrawn = true

		case shared.RLBounty:
			// try to run exploit PLACEHOLDER
			score, err := RunRLModel(env, inputPayload.BountyIndex, inputPayload.Exploit)
			if err != nil {
				return err
			}
			hackerAddr := metadata.MsgSender

			attempt := &shared.Attempt{
				Hacker: shared.Profile{
					Address: hackerAddr,
					Name:    inputPayload.Name,
					ImgLink: inputPayload.ImgLink,
				},
				InputIndex: metadata.InputIndex,
				Score:      score,
			}

			bounty.Attempts = append(bounty.Attempts, attempt)
		}

	default:
		return fmt.Errorf("invalid input: %v", input)
	}

	cJson, _ := json.Marshal(c.state)
	env.Report(cJson)

	return nil
}

func ExecutePayment(
	bounty *shared.AppBounty,
	hackerAddr common.Address,
	env rollmelette.Env,
) error {

	slog.Debug("Executing payment")
	accBounty := new(uint256.Int)
	// Move assets to hacker
	for _, sponsorship := range bounty.Sponsorships {
		accBounty = new(uint256.Int).Add(accBounty, sponsorship.Value)
		sponsor := sponsorship.Sponsor.Address

		// the hacker might be one of the sponsors
		// this should be impossible
		if sponsor == hackerAddr {
			continue
		}
		slog.Debug("Performing the transfer call")
		err := env.ERC20Transfer(bounty.Token, sponsor, hackerAddr, sponsorship.Value.ToBig())
		if err != nil {

			return fmt.Errorf("failed to transfer asset: %v", err)
		}
	}
	// generate voucher
	slog.Debug("Now calling ERC20Withdraw")
	idx, err := env.ERC20Withdraw(bounty.Token, hackerAddr, accBounty.ToBig())
	if err != nil {
		return fmt.Errorf("failed to generate voucher: %v", err)
	}
	slog.Debug("Voucher idx:")
	slog.Debug(string(idx))
	return nil
}

func (c *BugBusterContract) Inspect(env rollmelette.EnvInspector, payload []byte) error {
	// TODO remove this
	slog.Debug("New c is working as expected v44")
	var input shared.TestExploit
	err := json.Unmarshal(payload, &input)
	if err != nil {
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	// check if bounty exist
	bounty := c.state.GetBounty(input.BountyIndex)
	if bounty == nil {
		return fmt.Errorf("bounty not found")
	}

	slog.Debug("Bounty index:")
	slog.Debug(string(input.BountyIndex))

	switch bounty.BountyType {
	case shared.BugBounty:
		// try to run exploit
		if err := RunExploit(env, input.BountyIndex, input.Exploit, false); err != nil {
			return err
		}

	case shared.RLBounty:
		// try to run exploit PLACEHOLDER
		_, err := RunRLModel(env, input.BountyIndex, input.Exploit)
		if err != nil {
			return err
		}

		return err
	}

	return nil
}

func CodePath(bountyIndex int) string {
	return fmt.Sprintf("/bounties/%v.tar.xz", bountyIndex)
}

// Decode the code from base64, unzip it, and save it to a directory.
func DecodeUnzipStore(bountyIndex int, zipBinary string) error {
	bytes, err := base64.StdEncoding.DecodeString(zipBinary)
	if err != nil {
		return fmt.Errorf("failed to decode base64: %v", err)
	}
	path := CodePath(bountyIndex)
	err = os.WriteFile(path, bytes, 0644)
	if err != nil {
		return fmt.Errorf("failed to write file: %v", err)
	}
	return nil
}

func LinkBounty(bountyIndex int, zipPath string) error {
	path := CodePath(bountyIndex)
	err := os.Symlink(zipPath, path)
	if err != nil {
		return fmt.Errorf("failed to create symlink: %v", err)
	}
	return nil
}

type EnvLogger struct {
	env rollmelette.EnvInspector
}

func (l *EnvLogger) Write(p []byte) (int, error) {
	slog.Debug(string(p))
	l.env.Report(p)
	return len(p), nil
}

// Run the exploit for the given code.
// Return true if succeeds.
func RunExploit(env rollmelette.EnvInspector, bountyIndex int, exploit string, captureOutput bool) error {
	codePath := CodePath(bountyIndex)
	slog.Debug("testing exploit", "codePath", codePath)
	bytes, err := base64.StdEncoding.DecodeString(exploit)
	if err != nil {
		return fmt.Errorf("base64 decode failed: %v", err)
	}
	os.Remove("/var/tmp/exploit") // intentionally ignore errors
	err = os.WriteFile("/var/tmp/exploit", bytes, 0644)
	if err != nil {
		return fmt.Errorf("writing exploit to file failed: %s", err)
	}
	defer os.RemoveAll("/var/tmp/bounty")
	defer os.Remove("/var/tmp/exploit")
	cmd := exec.Command("bounty-run", codePath, "/var/tmp/bounty", "/var/tmp/exploit")
	cmd.Stdin = os.Stdin
	if captureOutput {
		cmd.Stdout = &EnvLogger{env}
		cmd.Stderr = &EnvLogger{env}
	} else {
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
	}
	err = cmd.Run()
	if err != nil {
		slog.Debug("exploit failed", "error", err)
		return fmt.Errorf("exploit failed")
	}
	slog.Debug("exploit succeeded!")
	return nil
}

func RunRLModel(env rollmelette.EnvInspector, bountyIndex int, exploit string) (float64, error) {
	codePath := CodePath(bountyIndex)
	slog.Debug("testing RL model", "codePath", codePath)
	bytes, err := base64.StdEncoding.DecodeString(exploit)
	if err != nil {
		return -1, fmt.Errorf("base64 decode failed: %v", err)
	}

	defer os.RemoveAll("/var/tmp/inference")
	defer os.Remove("/var/tmp/model.onnx")

	os.RemoveAll("/var/tmp/inference")
	os.Mkdir("/var/tmp/inference", 0777)

	err = os.WriteFile("/var/tmp/inference/model.onnx", bytes, 0644)
	if err != nil {
		return -1, fmt.Errorf("writing model to file failed: %s", err)
	}

	cmd := exec.Command("tar", "-xvf", codePath, "-C", "/var/tmp/inference")
	err = cmd.Run()
	if err != nil {
		return -1, fmt.Errorf("Error extracting tar file: %s", err)
	}

	cmd = exec.Command("python3", "/var/tmp/inference/test.py", "/var/tmp/inference/model.onnx")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return -1, fmt.Errorf("Error running command: ", string(output), err)
	}

	resultStr := string(output)              // Convert the byte slice to string
	resultStr = resultStr[:len(resultStr)-1] // Remove the trailing newline, if present

	// Parse the float64 value
	result, err := strconv.ParseFloat(resultStr, 64)
	if err != nil {
		return -1, fmt.Errorf("Error parsing float: ", err)
	}
	slog.Debug("inference succeeded!")
	return result, nil
}

func CheckOpenRLBounty(b *shared.AppBounty, currTime int64, env rollmelette.Env, c *BugBusterContract) (bool, error) {
	slog.Debug("In check open rl bounties")
	slog.Debug("checking")
	slog.Debug(b.Name)

	if b.BountyType == shared.RLBounty {

		if currTime < b.Deadline {
			return false, nil
		}

		if b.Attempts == nil {
			return false, nil
		}

		slog.Debug("There will be a winner")
		highest := b.Attempts[0]
		for _, attempt := range b.Attempts[1:] {
			if attempt.Score > highest.Score {
				highest = attempt
			}
		}

		slog.Debug("Highest is:")
		slog.Debug(fmt.Sprintf("%f", highest.Score))

		if err := ExecutePayment(b, highest.Hacker.Address, env); err != nil {
			return false, err
		}

		b.Exploit = &shared.Exploit{
			Hacker:     highest.Hacker,
			InputIndex: highest.InputIndex,
		}

		b.Withdrawn = true
		slog.Debug("chama")
		// Update reports
		cJson, _ := json.Marshal(c.state)
		env.Report(cJson)
	}
	return true, nil
}

func main() {
	ctx := context.Background()
	opts := rollmelette.NewRunOpts()
	app := new(BugBusterContract)
	err := rollmelette.Run(ctx, opts, app)
	if err != nil {
		slog.Error("application error", "error", err)
	}
}
