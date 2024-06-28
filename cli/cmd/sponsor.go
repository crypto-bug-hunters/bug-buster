package cmd

import (
	"bug-buster/shared"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
)

var sponsorCmd = &cobra.Command{
	Use:   "sponsor",
	Short: "A brief description of your command",
	Run:   sponsorRun,
}

var (
	sponsorBountyIndex int
	sponsorName        string
	sponsorImgLink     string
	sponsorToken       string
	sponsorValue       string
)

func sponsorRun(cmd *cobra.Command, args []string) {
	value, ok := new(big.Int).SetString(sponsorValue, 10)
	if !ok {
		log.Fatalf("failed to parse value")
		return
	}
	token := common.HexToAddress(sponsorToken)
	payload := &shared.AddSponsorship{
		BountyIndex: sponsorBountyIndex,
		Name:        sponsorName,
		ImgLink:     sponsorImgLink,
	}
	sendERC20(token, value, shared.AddSponsorshipInputKind, payload)
}

func init() {
	sendCmd.AddCommand(sponsorCmd)

	sponsorCmd.Flags().IntVarP(
		&sponsorBountyIndex, "bounty-index", "b", 0, "Index of the app bounty")
	sponsorCmd.MarkFlagRequired("bounty-index")

	sponsorCmd.Flags().StringVarP(
		&sponsorName, "name", "n", "", "Sponsor name")
	sponsorCmd.MarkFlagRequired("name")

	sponsorCmd.Flags().StringVarP(
		&sponsorImgLink, "image", "i", "", "Sponsor image")

	sponsorCmd.Flags().StringVarP(
		&sponsorToken, "token", "t", "", "Address of ERC-20 token")
	sponsorCmd.MarkFlagRequired("token")

	sponsorCmd.Flags().StringVarP(
		&sponsorValue, "value", "v", "", "Amount of tokens to sponsor")
	sponsorCmd.MarkFlagRequired("value")
}
