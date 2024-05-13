package main

import (
	"bugless/shared"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"

	"github.com/ethereum/go-ethereum/common"
	"github.com/holiman/uint256"
	"github.com/rollmelette/rollmelette"
)

type BugLessContract struct {
	state shared.BugLessState
}

func (c *BugLessContract) Advance(
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
		err := DecodeUnzipStore(bountyIndex, inputPayload.CodeZipBinary)
		if err != nil {
			return err
		}
		bounty := &shared.AppBounty{
			Name:         inputPayload.Name,
			ImgLink:      inputPayload.ImgLink,
			Description:  inputPayload.Description,
			Deadline:     inputPayload.Deadline,
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

		var etherDepositSender common.Address
		var etherDepositValue *uint256.Int

		switch deposit := deposit.(type) {
		case *rollmelette.EtherDeposit:
			etherDepositSender = deposit.Sender
			etherDepositValue, _ = uint256.FromBig(deposit.Value)
		default:
			return fmt.Errorf("unsupported deposit: %T", deposit)
		}

		sponsorship := bounty.GetSponsorship(etherDepositSender)
		if sponsorship != nil {
			// Add to existing sponsorship
			newValue := new(uint256.Int).Add(sponsorship.Value, etherDepositValue)
			sponsorship.Value = newValue
			// Update profile
			sponsorship.Sponsor.Name = inputPayload.Name
			sponsorship.Sponsor.ImgLink = inputPayload.ImgLink
		} else {
			// Create new sponsorship
			sponsorship := &shared.Sponsorship{
				Sponsor: shared.Profile{
					Address: etherDepositSender,
					Name:    inputPayload.Name,
					ImgLink: inputPayload.ImgLink,
				},
				Value: etherDepositValue,
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
			_, err := env.EtherWithdraw(sponsorship.Sponsor.Address, sponsorship.Value.ToBig())
			if err != nil {
				return fmt.Errorf("failed to withdraw: %v", err)
			}
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

		// check exploit
		if bounty.Exploit != nil {
			return fmt.Errorf("can't send exploit because exploit was found")
		}

		// check bounty deadline
		currTime := metadata.BlockTimestamp
		if currTime >= bounty.Deadline {
			return fmt.Errorf("can't run exploit after deadline")
		}

		// try to run exploit
		if err := RunExploit(env, inputPayload.BountyIndex, inputPayload.Exploit, false); err != nil {
			return err
		}

		// Move assets to hacker
		hacker := metadata.MsgSender
		accBounty := new(uint256.Int)
		for _, sponsorship := range bounty.Sponsorships {
			accBounty = new(uint256.Int).Add(accBounty, sponsorship.Value)
			sponsor := sponsorship.Sponsor.Address
			// the hacker might be one of the sponsors
			if sponsor == hacker {
				continue
			}
			err := env.EtherTransfer(sponsor, hacker, sponsorship.Value.ToBig())
			if err != nil {
				// this should be impossible
				return fmt.Errorf("failed to transfer asset: %v", err)
			}
		}

		// generate voucher
		_, err := env.EtherWithdraw(hacker, accBounty.ToBig())
		if err != nil {
			return fmt.Errorf("failed to generate voucher: %v", err)
		}

		// register exploit
		bounty.Exploit = &shared.Exploit{
			Hacker: shared.Profile{
				Address: hacker,
				Name:    inputPayload.Name,
				ImgLink: inputPayload.ImgLink,
			},
			InputIndex: metadata.InputIndex,
		}

		// set bounty as withdrawn
		bounty.Withdrawn = true

	default:
		return fmt.Errorf("invalid input: %v", input)
	}

	cJson, _ := json.Marshal(c.state)
	env.Report(cJson)

	return nil
}

func (c *BugLessContract) Inspect(env rollmelette.EnvInspector, payload []byte) error {
	var input shared.TestExploit
	err := json.Unmarshal(payload, &input)
	if err != nil {
		return fmt.Errorf("failed to unmarshal input: %w", err)
	}

	// check if bounty exist
	bounty := c.state.GetBounty(input.BountyIndex)
	if bounty == nil {
		return fmt.Errorf("bounty not found")
	}

	// try to run exploit
	if err := RunExploit(env, input.BountyIndex, input.Exploit, true); err != nil {
		return err
	}

	cJson, _ := json.Marshal(c.state)
	env.Report(cJson)

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

func main() {
	ctx := context.Background()
	opts := rollmelette.NewRunOpts()
	app := new(BugLessContract)
	err := rollmelette.Run(ctx, opts, app)
	if err != nil {
		slog.Error("application error", "error", err)
	}
}
