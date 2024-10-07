package cmd

import (
	"archive/tar"
	"bug-buster/shared"
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
	"github.com/ulikunitz/xz"
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
	bountyTypeFlag          string
)

func readEnvironmentFromTar(tarFilePath string) (string, error) {
	// Open the tar.xz file
	f, err := os.Open(tarFilePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	// Create a new xz reader
	xzReader, err := xz.NewReader(f)
	if err != nil {
		return "", err
	}

	// Create a tar reader from the decompressed xz data
	tr := tar.NewReader(xzReader)

	// Iterate through the tar entries
	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}

		// Check if the current file is "environment.py"
		if hdr.Name == "environment.py" {
			buf := new(bytes.Buffer)
			_, err = io.Copy(buf, tr)
			if err != nil {
				return "", err
			}
			return buf.String(), nil
		}
	}

	return "", fmt.Errorf("file 'environment.py' not found in tar file")
}

func bountyRun(cmd *cobra.Command, args []string) {
	var codeZipBinary *string
	var environment string = ""
	var bountyType shared.BountyType

	if bountyTypeFlag == "rl" {
		bountyType = shared.RLBounty
	} else {
		bountyType = shared.BugBounty
	}

	if bountyCodePathInHost != "" {
		code, err := bountyLoadCode()
		if err != nil {
			log.Fatal(err)
		}
		codeZipBinary = &code
		if bountyTypeFlag == "rl" {
			environment, err = readEnvironmentFromTar(bountyCodePathInHost)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
	var codeZipPath *string
	if bountyCodePathInMachine != "" {
		codeZipPath = &bountyCodePathInMachine
	}

	durationSecs := time.Duration(bountyDuration) * time.Second
	deadline := time.Now().UTC().Add(durationSecs).Unix()
	token := common.HexToAddress(bountyToken)
	log.Printf("----------------BOUNTY TYPE COMPUTED AT CLI: %d\n", bountyType)
	payload := &shared.CreateAppBounty{
		Name:          bountyName,
		ImgLink:       bountyImgLink,
		Description:   bountyDescription,
		BountyType:    bountyType,
		Deadline:      deadline,
		CodeZipBinary: codeZipBinary,
		CodeZipPath:   codeZipPath,
		Token:         token,
		Environment:   environment,
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

	bountyCmd.Flags().StringVarP(
		&bountyTypeFlag, "type", "k", "", "Bounty type - either rl or bug")
	bountyCmd.MarkFlagRequired("type")
}
