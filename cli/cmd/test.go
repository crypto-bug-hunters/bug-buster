package cmd

import (
	"bug-buster/shared"
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/rollmelette/rollmelette/integration"
	"github.com/spf13/cobra"
)

// testCmd represents the test command
var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Test whether a exploit breaks the app",
	Run:   testRun,
}

var (
	testBountyIndex int
	testPath        string
)

func testRun(cmd *cobra.Command, args []string) {
	InspectEndpoint := "http://localhost:8080/inspect"

	input := &shared.TestExploit{
		BountyIndex: testBountyIndex,
		Exploit:     loadExploit(testPath),
	}
	inputJson, err := json.Marshal(input)
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	result, err := integration.Inspect(ctx, InspectEndpoint, inputJson)
	if err != nil {
		log.Fatal(err)
	}
	if result.Status == integration.Accepted {
		log.Print("input accepted")
	} else {
		log.Print("input not accepted")
	}

	for _, logMsg := range result.Reports {
		log.Printf("contract: %v", logMsg)
	}
}

func init() {
	rootCmd.AddCommand(testCmd)

	testCmd.Flags().IntVarP(
		&testBountyIndex, "bounty-index", "b", 0, "Index of the app bounty")
	testCmd.MarkFlagRequired("bounty-index")

	testCmd.Flags().StringVarP(
		&testPath, "test", "e", "", "Path to the test file")
	testCmd.MarkFlagRequired("test")
}
