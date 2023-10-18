package shared

import (
	"fmt"

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

func (s *BugLessState) GetBounty(bountyIndex int) *AppBounty {
	if bountyIndex >= len(s.Bounties) {
		return nil
	}
	return s.Bounties[bountyIndex]
}

type AppBounty struct {
	Developer    Profile
	Description  string
	Started      int64 // (unix timestamp)
	Deadline     int64 // (unix timestamp)
	InputIndex   int
	Sponsorships []*Sponsorship
	Exploit      *Exploit
	Withdrawn    bool
}

func (b *AppBounty) GetSponsorship(sponsorAddress common.Address) *Sponsorship {
	for _, sponsorship := range b.Sponsorships {
		if sponsorship.Sponsor.Address == sponsorAddress {
			return sponsorship
		}
	}
	return nil
}

type Sponsorship struct {
	Sponsor Profile
	Value   *uint256.Int
}

type Exploit struct {
	Hacker     Profile
	InputIndex int
}

type Profile struct {
	Address common.Address
	Name    string
	ImgLink string // optional
}

//
// Advances inputs
//

type CreateAppBounty struct {
	Name          string
	ImgLink       string
	Description   string
	Deadline      int64  // (unix timestamp)
	CodeZipBinary string // base64?
}

func (b *CreateAppBounty) Validate() error {
	if b.Name == "" {
		return fmt.Errorf("empty CreateAppBounty.Name")
	}
	if b.Description == "" {
		return fmt.Errorf("empty CreateAppBounty.Description")
	}
	if b.Deadline == 0 {
		return fmt.Errorf("empty CreateAppBounty.Deadline")
	}
	if b.CodeZipBinary == "" {
		return fmt.Errorf("empty CreateAppBounty.CodeZipBinary")
	}
	return nil
}

// From portal (Ether)
type AddSponsorship struct {
	BountyIndex int
	Name        string
	ImgLink     string
}

func (s *AddSponsorship) Validate() error {
	if s.Name == "" {
		return fmt.Errorf("empty AddSponsorship.Name")
	}
	return nil
}

type WithdrawSponsorship struct {
	BountyIndex int
}

type SendExploit struct {
	BountyIndex int
	Name        string
	ImgLink     string
	Exploit     string
}

func (e *SendExploit) Validate() error {
	if e.Name == "" {
		return fmt.Errorf("empty SendExploit.Name")
	}
	if e.Exploit == "" {
		return fmt.Errorf("empty SendExploit.Exploit")
	}
	return nil
}

//
// Inspect inputs
//

// To check whether the exploit worked, check the CompletionStatus of the result
type TestExploit struct {
	BountyIndex int
	Exploit     string
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

func PrintCodecsKeys() {
	for _, codec := range Codecs() {
		fmt.Printf("%v\t%v\n", codec.Key(), codec.Type().Elem().Name())
	}
}
