package cmd

import (
	"bugless/shared"

	"github.com/spf13/cobra"
)

var withdrawArgs struct {
	bountyIndex int
}

var withdrawCmd = &cobra.Command{
	Use:   "withdraw",
	Short: "Withdraw from a bounties",
	Run: func(cmd *cobra.Command, args []string) {
		inputKind := shared.InputKind("WithdrawSponsorshipInputKind")
		payload := &shared.WithdrawSponsorship{
			BountyIndex: withdrawArgs.bountyIndex,
		}
		sendInput(inputKind, payload)
	},
}

func init() {
	sendCmd.AddCommand(withdrawCmd)

	withdrawCmd.Flags().IntVarP(
		&withdrawArgs.bountyIndex, "bounty-index", "b", 0, "Index of the app bounty")
	withdrawCmd.MarkFlagRequired("bounty-index")
}
