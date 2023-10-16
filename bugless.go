package bugless

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/holiman/uint256"
)

//
// State application
//

type BugLessState struct {
	Bounties []AppBounty
}

type AppBounty struct {
	App         Profile
	Description string
	Started     uint64 // (unix timestamp)
	Deadline    uint64 // (unix timestamp)
	AppCode     Code
	Sponsors    []Sponsorship
	Exploit     *Exploit
}

type Sponsorship struct {
	Sponsor Profile
	Value   *uint256.Int
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
// Advances
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
type AddSponsor struct {
	Name       string
	ImgLink    string
	AppAddress common.Address
}

type SendExploit struct {
}

type WithdrawSponsor struct {
}
