package cmd

import (
	"bugless/shared"

	"github.com/spf13/cobra"
)

var codecsCmd = &cobra.Command{
	Use:   "codecs",
	Short: "Print the codecs",
	Run: func(cmd *cobra.Command, args []string) {
		shared.PrintCodecsKeys()
	},
}

func init() {
	rootCmd.AddCommand(codecsCmd)
}
