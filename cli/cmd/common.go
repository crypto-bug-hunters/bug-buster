package cmd

import (
	"encoding/base64"
	"io"
	"log"
	"os"
)

func loadExploit(path string) string {
	f, err := os.Open(path)
	if err != nil {
		log.Fatalf("failed to open exploit file: %v", err)
	}
	defer f.Close()
	bytes, err := io.ReadAll(f)
	if err != nil {
		log.Fatalf("failed read exploit file: %v", err)
	}
	return base64.StdEncoding.EncodeToString(bytes)
}
