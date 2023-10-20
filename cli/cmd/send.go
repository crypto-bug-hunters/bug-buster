package cmd

import (
	"bugless/shared"
	"context"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/eggeth"
	"github.com/gligneul/eggroll/eggtypes"
	"github.com/spf13/cobra"
)

var sendArgs struct {
	accountIndex uint32
}

var sendCmd = &cobra.Command{
	Use:   "send",
	Short: "Send an advance-state input to the contract",
}

func sendDo(send func(context.Context, *eggroll.Client, eggeth.Signer) (int, error)) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, signer, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	if sendArgs.accountIndex != 0 {
		err := signer.(*eggeth.MnemonicSigner).SetAccount(sendArgs.accountIndex)
		if err != nil {
			log.Fatal(err)
		}
	}

	inputIndex, err := send(ctx, client, signer)

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

	for _, voucher := range result.Vouchers {
		log.Printf("voucher to %v with payload 0x%v",
			voucher.Destination, common.Bytes2Hex(voucher.Payload))
	}

	for _, logMsg := range result.Logs() {
		log.Printf("contract: %v", logMsg)
	}
}

func sendEther(txValue *big.Int, input any) {
	sendDo(func(ctx context.Context, c *eggroll.Client, s eggeth.Signer) (int, error) {
		return c.SendEther(ctx, s, txValue, input)
	})
}

func sendInput(input any) {
	sendDo(func(ctx context.Context, c *eggroll.Client, s eggeth.Signer) (int, error) {
		return c.SendInput(ctx, s, input)
	})
}

func sendDAppAddress() {
	sendDo(func(ctx context.Context, c *eggroll.Client, s eggeth.Signer) (int, error) {
		return c.SendDAppAddress(ctx, s)
	})
}

func init() {
	rootCmd.AddCommand(sendCmd)

	sendCmd.PersistentFlags().Uint32VarP(&sendArgs.accountIndex,
		"account-index", "a", 0, "Forge account index when sending the transaction")
}
