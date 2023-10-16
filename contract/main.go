package main

import (
	"github.com/gligneul/eggroll"
)

type TemplateContract struct {
	eggroll.DefaultContract
}

func (c *TemplateContract) Advance(env eggroll.Env) (any, error) {
	input := env.RawInput()
	env.Logf("received: %v", string(input))
	return input, nil
}

func main() {
	eggroll.Roll(&TemplateContract{})
}
