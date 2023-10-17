package shared

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/gligneul/eggroll"
	"github.com/holiman/uint256"
)

//
// Application state
//

type BugLessState struct {
	Bounties []*AppBounty
}

func (s *BugLessState) GetBounty(address common.Address) *AppBounty {
	for _, bounty := range s.Bounties {
		if bounty.App.Address == address {
			return bounty
		}
	}
	return nil
}

type AppBounty struct {
	App         Profile
	Description string
	Started     uint64 // (unix timestamp)
	Deadline    uint64 // (unix timestamp)
	AppCode     Code
	Sponsors    []*Sponsorship
	Exploit     *Exploit
}

type Sponsorship struct {
	Sponsor   Profile
	Value     *uint256.Int
	Withdrawn bool
}

type Exploit struct {
	Hacker      Profile
	ExploitCode Code
}

type Code struct {
	InputIndex int
	CodePath   string
}

type Profile struct {
	Address common.Address
	Name    string
	ImgLink string // optional
}

//
// Advances inputs
//

// From input box directly from user
type CreateAppBounty struct {
	Name          string
	Description   string
	ImgLink       string
	DeadLine      uint64 // (unix timestamp)
	CodeZipBinary string // base64?
}

// From portal (Ether/Erc20)
type AddSponsorship struct {
	Name       string
	ImgLink    string
	AppAddress common.Address
}

type WithdrawSponsorship struct {
	AppAddress common.Address
}

type SendExploit struct {
	Name          string
	ImgLink       string
	AppAddress    common.Address
	CodeZipBinary string // base64?
}

//
// Inspect inputs
//

type TestExploit struct {
	AppAddress    common.Address
	CodeZipBinary string // base64?
}

//
// Codecs
//

func Codecs() []eggroll.Codec {
	return []eggroll.Codec{
		eggroll.NewJSONCodec[BugLessState](),
		eggroll.NewJSONCodec[CreateAppBounty](),
		eggroll.NewJSONCodec[AddSponsorship](),
		eggroll.NewJSONCodec[WithdrawSponsorship](),
		eggroll.NewJSONCodec[SendExploit](),
		eggroll.NewJSONCodec[TestExploit](),
	}
}
