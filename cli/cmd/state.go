package cmd

import (
	"bugless/shared"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/eggtypes"
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

	client, _, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	results, err := client.GetResults(ctx, 0)
	if err != nil {
		log.Fatal(err)
	}

	state := findLastState(client, results)
	if state == nil {
		fmt.Println("{\"Bounties\":[]}")
	} else {
		stateJson, err := json.MarshalIndent(state, "", "  ")
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(stateJson))
	}
}

func findLastState(client *eggroll.Client, results []*eggtypes.AdvanceResult) *shared.BugLessState {
	for i := len(results) - 1; i >= 0; i-- {
		if len(results[i].RawReturn()) == 0 {
			continue
		}
		return_ := client.DecodeReturn(results[i])
		if return_ == nil {
			continue
		}
		state, ok := return_.(*shared.BugLessState)
		if !ok {
			log.Fatalf("failed to decode return: %v", return_)
		}
		return state
	}
	return nil
}

func init() {
	rootCmd.AddCommand(stateCmd)
}
