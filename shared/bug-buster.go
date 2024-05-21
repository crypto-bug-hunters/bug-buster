package shared

import (
	"encoding/json"
	"fmt"

	"github.com/ethereum/go-ethereum/common"
	"github.com/holiman/uint256"
)

//
// Application state
//

type BugBusterState struct {
	Bounties []*AppBounty `json:"bounties"`
}

func (s *BugBusterState) GetBounty(bountyIndex int) *AppBounty {
	if bountyIndex >= len(s.Bounties) {
		return nil
	}
	return s.Bounties[bountyIndex]
}

type AppBounty struct {
	Name         string         `json:"name"`
	ImgLink      string         `json:"imgLink"` // optional
	Description  string         `json:"description"`
	Deadline     int64          `json:"deadline"` // (unix timestamp)
	Sponsorships []*Sponsorship `json:"sponsorships"`
	Exploit      *Exploit       `json:"exploit"`
	Withdrawn    bool           `json:"withdrawn"`
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
	Sponsor Profile      `json:"sponsor"`
	Value   *uint256.Int `json:"value"`
}

type Exploit struct {
	Hacker     Profile `json:"hacker"`
	InputIndex int     `json:"inputIndex"`
}

type Profile struct {
	Address common.Address `json:"address"`
	Name    string         `json:"name"`
	ImgLink string         `json:"imgLink"` // optional
}

//
// Advances inputs
//

type InputKind string

const (
	CreateAppBountyInputKind     InputKind = "CreateAppBounty"
	AddSponsorshipInputKind      InputKind = "AddSponsorship"
	WithdrawSponsorshipInputKind InputKind = "WithdrawSponsorship"
	SendExploitInputKind         InputKind = "SendExploit"
)

type Input struct {
	Kind    InputKind       `json:"kind"`
	Payload json.RawMessage `json:"payload"`
}

type CreateAppBounty struct {
	Name          string  `json:"name"`
	ImgLink       string  `json:"imgLink"`
	Description   string  `json:"description"`
	Deadline      int64   `json:"deadline"`                // (unix timestamp)
	CodeZipBinary *string `json:"codeZipBinary,omitempty"` // base64?
	CodeZipPath   *string `json:"codeZipPath,omitempty"`
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
	if b.CodeZipBinary == nil && b.CodeZipPath == nil {
		return fmt.Errorf("empty CreateAppBounty.{CodeZipBinary, CodeZipPath}")
	}
	return nil
}

// From portal (Ether)
type AddSponsorship struct {
	BountyIndex int    `json:"bountyIndex"`
	Name        string `json:"name"`
	ImgLink     string `json:"imgLink"`
}

func (s *AddSponsorship) Validate() error {
	if s.Name == "" {
		return fmt.Errorf("empty AddSponsorship.Name")
	}
	return nil
}

type WithdrawSponsorship struct {
	BountyIndex int `json:"bountyIndex"`
}

type SendExploit struct {
	BountyIndex int    `json:"bountyIndex"`
	Name        string `json:"name"`
	ImgLink     string `json:"imgLink"`
	Exploit     string `json:"exploit"`
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
	BountyIndex int    `json:"bountyIndex"`
	Exploit     string `json:"exploit"`
}
