package main

import (
	"context"
	"fmt"
	"os"

	"github.com/gligneul/eggroll"
)

func main() {
	input := os.Args[1]
	ctx := context.Background()
	client, signer, _ := eggroll.NewDevClient(ctx, nil)
	inputIndex, _ := client.SendInput(ctx, signer, []byte(input))
	result, _ := client.WaitFor(ctx, inputIndex)
	fmt.Println(string(result.RawReturn()))
}
