package cmd

import (
	"bugless/shared"
	"log"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/holiman/uint256"
	"github.com/spf13/cobra"
)

var sponsorCmd = &cobra.Command{
	Use:   "sponsor",
	Short: "A brief description of your command",
	Run:   sponsorRun,
}

var (
	sponsorName       string
	sponsorImgLink    string
	sponsorAppAddress string
	sponsorValue      string
)

func sponsorRun(cmd *cobra.Command, args []string) {
	value := new(uint256.Int)
	err := value.SetFromDecimal(sponsorValue)
	if err != nil {
		log.Fatalf("failed to parse value: %v", err)
	}

	appAddress, err := hexutil.Decode(sponsorAppAddress)
	if err != nil {
		log.Fatalf("failed to decode address: %v", err)
	}

	input := &shared.AddSponsorship{
		Name:       sponsorName,
		ImgLink:    sponsorImgLink,
		AppAddress: common.Address(appAddress),
	}

	sendEther(value.ToBig(), input)
}

func init() {
	sendCmd.AddCommand(sponsorCmd)

	sponsorCmd.Flags().StringVarP(
		&sponsorName, "name", "n", "", "Sponsor name")
	sponsorCmd.MarkFlagRequired("name")

	sponsorCmd.Flags().StringVarP(
		&sponsorImgLink, "image", "i", "", "Sponsor image")
	sponsorCmd.MarkFlagRequired("image")

	sponsorCmd.Flags().StringVarP(
		&sponsorAppAddress, "app-address", "a", "", "Address of the app bounty")
	sponsorCmd.MarkFlagRequired("app-address")

	sponsorCmd.Flags().StringVarP(
		&sponsorValue, "value", "v", "", "Value to sponsor in Wei")
	sponsorCmd.MarkFlagRequired("value")
}
