package cmd

import (
	"bugless/shared"
	"context"
	"log"
	"time"

	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/eggtypes"
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
	input := &shared.TestExploit{
		BountyIndex: testBountyIndex,
		Exploit:     loadExploit(testPath),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, _, err := eggroll.NewDevClient(ctx, shared.Codecs())
	if err != nil {
		log.Fatal(err)
	}

	result, err := client.Inspect(ctx, input)
	if err != nil {
		log.Fatal(err)
	}

	if result.Status == eggtypes.CompletionStatusAccepted {
		log.Print("input accepted")
	} else {
		log.Print("input not accepted")
	}

	for _, logMsg := range result.Logs() {
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
