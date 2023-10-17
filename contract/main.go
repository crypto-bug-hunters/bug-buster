package main

import (
	"bugless/shared"
	"fmt"

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

		// check if bounty exist
		if c.state.GetBounty(env.Sender()) != nil {
			return nil, fmt.Errorf("bounty already exists")
		}

		// Check deadline
		metadata := env.Metadata()
		currTime := metadata.BlockTimestamp
		if input.Deadline <= currTime {
			return nil, fmt.Errorf("deadline already over")
		}

		// create new bounty
		codePath := DecodeUnzipStore(input.CodeZipBinary)
		bounty := &shared.AppBounty{
			App: shared.Profile{
				Address: env.Sender(),
				Name:    input.Name,
				ImgLink: input.ImgLink,
			},
			Description:  input.Description,
			Started:      currTime,
			Deadline:     input.Deadline,
			InputIndex:   metadata.InputIndex,
			CodePath:     codePath,
			Sponsorships: nil,
			Exploit:      nil,
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
		bounty := c.state.GetBounty(input.AppAddress)
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
				Value:     &deposit.Value,
				Withdrawn: false,
			}
			bounty.Sponsorships = append(bounty.Sponsorships, sponsorship)
		}

	case *shared.WithdrawSponsorship:
		// check if bounty exist
		bounty := c.state.GetBounty(input.AppAddress)
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

		// check sponsorship
		sponsorship := bounty.GetSponsorship(env.Sender())
		if sponsorship == nil {
			return nil, fmt.Errorf("sponsorship not found")
		}

		// check if already withdrawn
		if sponsorship.Withdrawn {
			return nil, fmt.Errorf("sponsorship already withdrawn")
		}

		// generate voucher
		_, err := env.EtherWithdraw(env.Sender(), sponsorship.Value)
		if err != nil {
			return nil, fmt.Errorf("failed to withdraw: %v", err)
		}

		// set sponsorship as withdrawn
		sponsorship.Withdrawn = true

	case *shared.SendExploit:
		// validate input
		if err := input.Validate(); err != nil {
			return nil, err
		}

		// check if bounty exist
		bounty := c.state.GetBounty(input.AppAddress)
		if bounty == nil {
			return nil, fmt.Errorf("bounty not found")
		}

		// check exploit
		if bounty.Exploit != nil {
			return nil, fmt.Errorf("can't send exploit because exploit was found")
		}

		// check bounty deadline
		currTime := env.Metadata().BlockTimestamp
		if currTime < bounty.Deadline {
			return nil, fmt.Errorf("can't run exploit after deadline")
		}

		// try to run exploit
		if !RunExploit(bounty.CodePath, input.Exploit) {
			return nil, fmt.Errorf("exploit failed")
		}

		// Move assets to hacker
		hacker := env.Sender()
		accBounty := new(uint256.Int)
		for _, sponsorship := range bounty.Sponsorships {
			sponsor := sponsorship.Sponsor.Address
			// the hacker might be one of the sponsors
			if sponsor != hacker {
				err := env.EtherTransfer(sponsor, env.Sender(), sponsorship.Value)
				if err != nil {
					// this should be impossible
					return nil, fmt.Errorf("failed to transfer asset: %v", err)
				}
			}
			accBounty = new(uint256.Int).Add(accBounty, sponsorship.Value)
		}

		// generate voucher
		_, err := env.EtherWithdraw(env.Sender(), accBounty)
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
	bounty := c.state.GetBounty(input.AppAddress)
	if bounty == nil {
		return nil, fmt.Errorf("bounty not found")
	}

	// try to run exploit
	if !RunExploit(bounty.CodePath, input.Exploit) {
		return nil, fmt.Errorf("exploit failed")
	}

	return &c.state, nil
}

func (c *BugLessContract) Codecs() []eggroll.Codec {
	return shared.Codecs()
}

// Decode the code from base64, unzip it, and save it to a directory.
func DecodeUnzipStore(zipBinary string) string {
	// TODO
	return "/some/path"
}

// Run the exploit for the given code.
// Return true if succeeds.
func RunExploit(codePath string, exploit string) bool {
	// TODO
	return true
}

func main() {
	eggroll.Roll(&BugLessContract{})
}
