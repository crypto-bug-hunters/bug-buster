package main

import (
	"bugless/shared"
	"fmt"

	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/wallets"
)

type BugLessContract struct {
	shared.BugLessState
}

func (c *BugLessContract) Advance(env eggroll.Env) (any, error) {
	switch input := env.DecodeInput().(type) {
	case *shared.CreateAppBounty:
		if c.GetBounty(env.Sender()) != nil {
			return nil, fmt.Errorf("bounty already exists")
		}
		// TODO

	case *shared.AddSponsorship:
		etherDeposit, ok := env.Deposit().(*wallets.EtherDeposit)
		if !ok {
			return nil, fmt.Errorf("expected ether deposit")
		}
		_ = etherDeposit
		// TODO

	case *shared.WithdrawSponsorship:
		// TODO

	case *shared.SendExploit:
		// TODO

	default:
		return nil, fmt.Errorf("invalid input: %v", input)
	}

	return &c.BugLessState, nil
}

func (c *BugLessContract) Inspect(env eggroll.EnvReader) (any, error) {

	return nil, nil
}

func (c *BugLessContract) Codecs() []eggroll.Codec {
	return shared.Codecs()
}

func main() {
	eggroll.Roll(&BugLessContract{})
}
