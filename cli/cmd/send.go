package cmd

import (
	"bugless/shared"
	"context"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/eggtypes"
	"github.com/spf13/cobra"
)

var sendCmd = &cobra.Command{
	Use:   "send",
	Short: "Send an advance-state input to the contract",
}

func sendEther(txValue *big.Int, input any) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, signer, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	inputIndex, err := client.SendEther(ctx, signer, txValue, input)
	checkResult(ctx, client, inputIndex, err)
}

func sendInput(input any) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, signer, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	inputIndex, err := client.SendInput(ctx, signer, input)
	checkResult(ctx, client, inputIndex, err)
}

func sendDAppAddress() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, signer, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	inputIndex, err := client.SendDAppAddress(ctx, signer)
	checkResult(ctx, client, inputIndex, err)
}

func checkResult(ctx context.Context, client *eggroll.Client, inputIndex int, err error) {
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("added input %v", inputIndex)

	result, err := client.WaitFor(ctx, inputIndex)
	if err != nil {
		log.Fatal(err)
	}

	if result.Status == eggtypes.CompletionStatusAccepted {
		log.Print("input accepted")
	} else {
		log.Print("input not accepted")
	}

	if len(result.Vouchers) > 0 {
		voucher := result.Vouchers[0]
		log.Printf("got voucher to %v with payload 0x%v",
			voucher.Destination, common.Bytes2Hex(voucher.Payload))
	}

	for _, logMsg := range result.Logs() {
		log.Printf("contract: %v", logMsg)
	}
}

func init() {
	rootCmd.AddCommand(sendCmd)
}
