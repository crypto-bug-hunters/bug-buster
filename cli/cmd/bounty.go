package cmd

import (
	"bug-buster/shared"
	"encoding/base64"
	"io"
	"log"
	"os"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
)

var bountyCmd = &cobra.Command{
	Use:   "bounty",
	Short: "Create a new app bounty",
	Run:   bountyRun,
}

var (
	bountyName              string
	bountyImgLink           string
	bountyDescription       string
	bountyDuration          int64
	bountyCodePathInMachine string
	bountyCodePathInHost    string
	bountyToken             string
)

func bountyRun(cmd *cobra.Command, args []string) {
	var codeZipBinary *string
	if bountyCodePathInHost != "" {
		code, err := bountyLoadCode()
		if err != nil {
			log.Fatal(err)
		}
		codeZipBinary = &code
	}
	var codeZipPath *string
	if bountyCodePathInMachine != "" {
		codeZipPath = &bountyCodePathInMachine
	}
	durationSecs := time.Duration(bountyDuration) * time.Second
	deadline := time.Now().UTC().Add(durationSecs).Unix()
	token := common.HexToAddress(bountyToken)
	payload := &shared.CreateAppBounty{
		Name:          bountyName,
		ImgLink:       bountyImgLink,
		Description:   bountyDescription,
		Deadline:      deadline,
		CodeZipBinary: codeZipBinary,
		CodeZipPath:   codeZipPath,
		Token:         token,
	}
	sendInput(shared.CreateAppBountyInputKind, payload)
}

func bountyLoadCode() (string, error) {
	f, err := os.Open(bountyCodePathInHost)
	if err != nil {
		log.Fatalf("failed to open code zip: %v", err)
	}
	defer f.Close()
	bytes, err := io.ReadAll(f)
	if err != nil {
		log.Fatalf("failed read code zip: %v", err)
	}
	// Limit code zip to 500kb
	if len(bytes) > 500<<10 {
		log.Fatalf("zip too big: %v; max is 500kb", len(bytes))
	}
	encoded := base64.StdEncoding.EncodeToString(bytes)
	return encoded, nil
}

func init() {
	sendCmd.AddCommand(bountyCmd)

	bountyCmd.Flags().StringVarP(
		&bountyName, "name", "n", "", "App name")
	bountyCmd.MarkFlagRequired("name")

	bountyCmd.Flags().StringVarP(
		&bountyImgLink, "image", "i", "", "App image")

	bountyCmd.Flags().StringVarP(
		&bountyDescription, "description", "d", "", "App description")
	bountyCmd.MarkFlagRequired("description")

	bountyCmd.Flags().Int64Var(
		&bountyDuration, "duration", 24*60*60, "duration of the bounty in secods")

	bountyCmd.Flags().StringVarP(
		&bountyCodePathInHost, "code", "c", "", "Path to the code zip (in the host filesystem)")
	bountyCmd.Flags().StringVarP(
		&bountyCodePathInMachine, "path", "p", "", "Path to the code zip (in the machine filesystem)")
	bountyCmd.MarkFlagsOneRequired("code", "path")
	bountyCmd.MarkFlagsMutuallyExclusive("code", "path")

	bountyCmd.Flags().StringVarP(
		&bountyToken, "token", "t", "", "Token address")
	bountyCmd.MarkFlagRequired("token")
}
