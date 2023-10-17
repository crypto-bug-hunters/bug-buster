package cmd

import (
	"bugless/shared"
	"context"
	"log"
	"time"

	"github.com/gligneul/eggroll"
	"github.com/spf13/cobra"
)

var sendCmd = &cobra.Command{
	Use:   "send",
	Short: "Send an advance-state input to the contract",
}

func sendInputAndPrintLogs(input any) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, signer, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	inputIndex, err := client.SendInput(ctx, signer, input)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("added input %v", inputIndex)

	result, err := client.WaitFor(ctx, inputIndex)
	if err != nil {
		log.Fatal(err)
	}

	for _, logMsg := range result.Logs() {
		log.Printf("contract: %v", logMsg)
	}
}

func init() {
	rootCmd.AddCommand(sendCmd)
}
