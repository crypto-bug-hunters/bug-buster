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
		payload := &shared.WithdrawSponsorship{
			BountyIndex: withdrawArgs.bountyIndex,
		}
		sendInput(shared.WithdrawSponsorshipInputKind, payload)
	},
}

func init() {
	sendCmd.AddCommand(withdrawCmd)

	withdrawCmd.Flags().IntVarP(
		&withdrawArgs.bountyIndex, "bounty-index", "b", 0, "Index of the app bounty")
	withdrawCmd.MarkFlagRequired("bounty-index")
}
