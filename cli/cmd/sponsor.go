package cmd

import (
	"bugless/shared"
	"log"

	"github.com/holiman/uint256"
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
	value := new(uint256.Int)
	err := value.SetFromDecimal(sponsorValue)
	if err != nil {
		log.Fatalf("failed to parse value: %v", err)
	}
	input := &shared.AddSponsorship{
		BountyIndex: sponsorBountyIndex,
		Name:        sponsorName,
		ImgLink:     sponsorImgLink,
	}
	sendEther(value.ToBig(), input)
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
		&sponsorValue, "value", "v", "", "Value to sponsor in Wei")
	sponsorCmd.MarkFlagRequired("value")
}
