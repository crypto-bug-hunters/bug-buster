package cmd

import (
	"bugless/shared"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/Khan/genqlient/graphql"
	"github.com/cartesi/rollups-node/pkg/readerclient"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/spf13/cobra"
)

var stateCmd = &cobra.Command{
	Use:   "state",
	Short: "Get the latest state from the contract",
	Run:   stateRun,
}

func stateRun(cmd *cobra.Command, args []string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client := graphql.NewClient("http://127.0.0.1:8080/graphql", nil)
	inputs, err := readerclient.GetInputs(ctx, client)
	if err != nil {
		log.Fatal(err)
	}

	state := findLastState(inputs)
	if state == nil {
		state = new(shared.BugLessState)
		state.Bounties = make([]*shared.AppBounty, 0)
	}

	stateJson, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(stateJson))
}

func findLastState(inputs []readerclient.Input) *shared.BugLessState {
	for i := len(inputs) - 1; i >= 0; i-- {
		if len(inputs[i].Reports) == 0 {
			continue
		}

		if inputs[i].Status != readerclient.CompletionStatusAccepted {
			continue
		}

		report := inputs[i].Reports[0] // each input only has 1 report at the moment
		payloadString := report.Payload.String()
		payload, err := hexutil.Decode(payloadString)
		if err != nil {
			log.Fatal(err)
		}

		var state shared.BugLessState
		err = json.Unmarshal(payload, &state)

		if err != nil {
			log.Fatal(err)
		}

		return &state
	}
	return nil
}

func init() {
	rootCmd.AddCommand(stateCmd)
}
