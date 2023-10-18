package main

import (
	"bugless/shared"
	"encoding/base64"
	"fmt"
	"os"
	"os/exec"

	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/wallets"
	"github.com/holiman/uint256"
)

type BugLessContract struct {
	state shared.BugLessState
}

func (c *BugLessContract) Advance(env eggroll.Env) (any, error) {
	switch input := env.DecodeInput().(type) {
	case *shared.CreateAppBounty:
		// validate input
		if err := input.Validate(); err != nil {
			return nil, err
		}

		// Check deadline
		metadata := env.Metadata()
		currTime := metadata.BlockTimestamp
		if input.Deadline <= currTime {
			return nil, fmt.Errorf("deadline already over")
		}

		// create new bounty
		bountyIndex := len(c.state.Bounties)
		err := DecodeUnzipStore(bountyIndex, input.CodeZipBinary)
		if err != nil {
			return nil, err
		}
		bounty := &shared.AppBounty{
			Developer: shared.Profile{
				Address: env.Sender(),
				Name:    input.Name,
				ImgLink: input.ImgLink,
			},
			Description:  input.Description,
			Started:      currTime,
			Deadline:     input.Deadline,
			InputIndex:   metadata.InputIndex,
			Sponsorships: nil,
			Exploit:      nil,
			Withdrawn:    false,
		}
		c.state.Bounties = append(c.state.Bounties, bounty)

	case *shared.AddSponsorship:
		// validate input
		if err := input.Validate(); err != nil {
			return nil, err
		}

		// get ether deposit
		deposit, ok := env.Deposit().(*wallets.EtherDeposit)
		if !ok {
			return nil, fmt.Errorf("expected ether deposit")
		}

		// check if bounty exist
		bounty := c.state.GetBounty(input.BountyIndex)
		if bounty == nil {
			return nil, fmt.Errorf("bounty not found")
		}

		// check exploit
		if bounty.Exploit != nil {
			return nil, fmt.Errorf("can't add sponsorship because exploit was found")
		}

		// check bounty deadline
		currTime := env.Metadata().BlockTimestamp
		if currTime >= bounty.Deadline {
			return nil, fmt.Errorf("can't add sponsorship after deadline")
		}

		sponsorship := bounty.GetSponsorship(env.Sender())
		if sponsorship != nil {
			// Add to existing sponsorship
			newValue := new(uint256.Int).Add(sponsorship.Value, &deposit.Value)
			sponsorship.Value = newValue
		} else {
			// Create new sponsorship
			sponsorship := &shared.Sponsorship{
				Sponsor: shared.Profile{
					Address: env.Sender(),
					Name:    input.Name,
					ImgLink: input.ImgLink,
				},
				Value: &deposit.Value,
			}
			bounty.Sponsorships = append(bounty.Sponsorships, sponsorship)
		}

	case *shared.WithdrawSponsorship:
		// check if bounty exist
		bounty := c.state.GetBounty(input.BountyIndex)
		if bounty == nil {
			return nil, fmt.Errorf("bounty not found")
		}

		// check exploit
		if bounty.Exploit != nil {
			return nil, fmt.Errorf("can't withdraw because exploit was found")
		}

		// check bounty deadline
		currTime := env.Metadata().BlockTimestamp
		if currTime < bounty.Deadline {
			return nil, fmt.Errorf("can't withdraw before deadline")
		}

		// check if already withdrawn
		if bounty.Withdrawn {
			return nil, fmt.Errorf("sponsorships already withdrawn")
		}

		// generate voucher for each sponsor
		for _, sponsorship := range bounty.Sponsorships {
			_, err := env.EtherWithdraw(sponsorship.Sponsor.Address, sponsorship.Value)
			if err != nil {
				return nil, fmt.Errorf("failed to withdraw: %v", err)
			}
		}

		// set bounty as withdrawn
		bounty.Withdrawn = true

	case *shared.SendExploit:
		// validate input
		if err := input.Validate(); err != nil {
			return nil, err
		}

		// check if bounty exist
		bounty := c.state.GetBounty(input.BountyIndex)
		if bounty == nil {
			return nil, fmt.Errorf("bounty not found")
		}

		// check exploit
		if bounty.Exploit != nil {
			return nil, fmt.Errorf("can't send exploit because exploit was found")
		}

		// check bounty deadline
		currTime := env.Metadata().BlockTimestamp
		if currTime >= bounty.Deadline {
			return nil, fmt.Errorf("can't run exploit after deadline")
		}

		// try to run exploit
		if err := RunExploit(env, input.BountyIndex, input.Exploit); err != nil {
			return nil, err
		}

		// Move assets to hacker
		hacker := env.Sender()
		accBounty := new(uint256.Int)
		for _, sponsorship := range bounty.Sponsorships {
			accBounty = new(uint256.Int).Add(accBounty, sponsorship.Value)
			sponsor := sponsorship.Sponsor.Address
			// the hacker might be one of the sponsors
			if sponsor == hacker {
				continue
			}
			err := env.EtherTransfer(sponsor, hacker, sponsorship.Value)
			if err != nil {
				// this should be impossible
				return nil, fmt.Errorf("failed to transfer asset: %v", err)
			}
		}

		// generate voucher
		_, err := env.EtherWithdraw(hacker, accBounty)
		if err != nil {
			return nil, fmt.Errorf("failed to generate voucher")
		}

		// register exploit
		bounty.Exploit = &shared.Exploit{
			Hacker: shared.Profile{
				Address: hacker,
				Name:    input.Name,
				ImgLink: input.ImgLink,
			},
			Exploit: input.Exploit,
		}

		// set bounty as withdrawn
		bounty.Withdrawn = true

	default:
		return nil, fmt.Errorf("invalid input: %v", input)
	}

	return &c.state, nil
}

func (c *BugLessContract) Inspect(env eggroll.EnvReader) (any, error) {
	input, ok := env.DecodeInput().(*shared.TestExploit)
	if !ok {
		return nil, fmt.Errorf("expected TestExploit input")
	}

	// check if bounty exist
	bounty := c.state.GetBounty(input.BountyIndex)
	if bounty == nil {
		return nil, fmt.Errorf("bounty not found")
	}

	// try to run exploit
	if err := RunExploit(env, input.BountyIndex, input.Exploit); err != nil {
		return nil, err
	}

	return &c.state, nil
}

func (c *BugLessContract) Codecs() []eggroll.Codec {
	return shared.Codecs()
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
	prefix string
	env    eggroll.EnvReader
}

func (l *EnvLogger) Write(p []byte) (int, error) {
	l.env.Logf("%v %v", l.prefix, string(p))
	return len(p), nil

}

// Run the exploit for the given code.
// Return true if succeeds.
func RunExploit(env eggroll.EnvReader, bountyIndex int, exploit string) error {
	codePath := CodePath(bountyIndex)
	env.Logf("testing an exploit for %v", codePath)
	bytes, err := base64.StdEncoding.DecodeString(exploit)
	if err != nil {
		return fmt.Errorf("base64 decode failed: %v", err)
	}
	os.Remove("/var/tmp/exploit") // intentionally ignore errors
	err = os.WriteFile("/var/tmp/exploit", bytes, 0644)
	if err != nil {
		return fmt.Errorf("writing exploit to file failed: %s", err)
	}
	defer os.Remove("/var/tmp/exploit")
	cmd := exec.Command("bounty-run", codePath)
	cmd.Stdout = &EnvLogger{"APP OUT", env}
	cmd.Stderr = &EnvLogger{"APP ERR", env}
	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("exploit failed: %v", err)
	}
	env.Log("exploit succeeded!")
	return nil
}

func main() {
	eggroll.Roll(&BugLessContract{})
}
