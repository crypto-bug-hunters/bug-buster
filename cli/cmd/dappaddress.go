package cmd

import (
	"github.com/spf13/cobra"
)

var dappAddressCmd = &cobra.Command{
	Use:   "dapp-address",
	Short: "Send dapp address to the contract",
	Run:   dappAddressRun,
}

func dappAddressRun(cmd *cobra.Command, args []string) {
	sendDAppAddress()
}

func init() {
	sendCmd.AddCommand(dappAddressCmd)
}
