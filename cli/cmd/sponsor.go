package cmd

import (
	"bugless/shared"
	"log"
	"math/big"

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
	sponsorValue       string
)

func sponsorRun(cmd *cobra.Command, args []string) {
	etherValue, ok := new(big.Float).SetString(sponsorValue)
	if !ok {
		log.Fatalf("failed to parse value")
	}
	tenToEighteen := new(big.Float).SetFloat64(1e18)
	weiValue := new(big.Float).Mul(etherValue, tenToEighteen)
	value := new(big.Int)
	weiValue.Int(value)
	payload := &shared.AddSponsorship{
		BountyIndex: sponsorBountyIndex,
		Name:        sponsorName,
		ImgLink:     sponsorImgLink,
	}
	sendEther(value, shared.AddSponsorshipInputKind, payload)
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
		&sponsorValue, "value", "v", "", "Value to sponsor in Ether")
	sponsorCmd.MarkFlagRequired("value")
}
