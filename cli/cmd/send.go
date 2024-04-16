package cmd

import (
	"bugless/shared"
	"context"
	"encoding/json"
	"log"
	"math/big"
	"os/exec"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/gligneul/rollmelette"
	"github.com/spf13/cobra"
)

var sendArgs struct {
	fromAddress string
}

var sendCmd = &cobra.Command{
	Use:   "send",
	Short: "Send an advance-state input to the contract",
}

var addressBook = rollmelette.NewAddressBook()

var dappAddress = "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"

func sendDo(inputKind shared.InputKind, payload any, send func(string, context.Context) ([]byte, error)) {
	payloadJson, err := json.Marshal(payload)
	if err != nil {
		log.Fatal(err)
	}
	input := shared.Input{
		Kind:    inputKind,
		Payload: payloadJson,
	}
	inputJson, err := json.Marshal(input)
	if err != nil {
		log.Fatal(err)
	}
	inputJsonStr := hexutil.Encode(inputJson)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	output, err := send(inputJsonStr, ctx)
	if err != nil {
		log.Fatal(string(output), err)
	}
	log.Printf("input added\n%s", output)
}

func sendEther(txValue *big.Int, inputKind shared.InputKind, payload any) {
	sendDo(inputKind, payload, func(inputJsonStr string, ctx context.Context) ([]byte, error) {
		cmd := exec.CommandContext(ctx,
			"cast", "send",
			"--unlocked", "--from", sendArgs.fromAddress,
			"--value", txValue.String(),
			addressBook.EtherPortal.String(), // TO
			"depositEther(address,bytes)",    // SIG
			dappAddress, inputJsonStr,        // ARGS
		)
		return cmd.CombinedOutput()
	})
}

func sendInput(inputKind shared.InputKind, payload any) {
	sendDo(inputKind, payload, func(inputJsonStr string, ctx context.Context) ([]byte, error) {
		cmd := exec.CommandContext(ctx,
			"cast", "send",
			"--unlocked", "--from", sendArgs.fromAddress,
			addressBook.InputBox.String(),      // TO
			"addInput(address,bytes)(bytes32)", // SIG
			dappAddress, inputJsonStr,          // ARGS
		)
		return cmd.CombinedOutput()
	})
}

func sendDAppAddress() {
	sendDo("", "", func(inputJsonStr string, ctx context.Context) ([]byte, error) {
		cmd := exec.CommandContext(ctx,
			"cast", "send",
			"--unlocked", "--from", sendArgs.fromAddress,
			addressBook.AppAddressRelay.String(), // TO
			"relayDAppAddress(address)",          // SIG
			dappAddress,                          // ARGS
		)
		return cmd.CombinedOutput()
	})
}

func init() {
	rootCmd.AddCommand(sendCmd)

	sendCmd.PersistentFlags().StringVarP(&sendArgs.fromAddress,
		"from-address", "f", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
		"Sender address when sending the transaction")
}
