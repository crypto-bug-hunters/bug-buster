package main

import (
	"context"
	"testing"
	"time"

	"github.com/gligneul/eggroll"
	"github.com/gligneul/eggroll/eggtest"
)

const testTimeout = 300 * time.Second

func TestTemplate(t *testing.T) {
	tester := eggtest.NewIntegrationTester(t)
	defer tester.Close()

	ctx, cancel := context.WithTimeout(context.Background(), testTimeout)
	defer cancel()

	client, signer, err := eggroll.NewDevClient(ctx, nil)
	if err != nil {
		t.Fatalf("failed to create client: %v", err)
	}

	inputIndex, err := client.SendInput(ctx, signer, []byte("eggroll"))
	if err != nil {
		t.Fatalf("failed to send input: %v", err)
	}

	result, err := client.WaitFor(ctx, inputIndex)
	if err != nil {
		t.Fatalf("failed to wait for input: %v", err)
	}

	return_ := string(result.RawReturn())
	if return_ != "eggroll" {
		t.Fatalf("wrong result: %v", return_)
	}

	logs := result.Logs()
	if len(logs) != 1 || logs[0] != "received: eggroll" {
		t.Fatalf("wrong logs: %v", logs)
	}
}
