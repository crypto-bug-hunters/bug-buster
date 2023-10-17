/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"bugless/shared"
	"log"
	"time"

	"github.com/spf13/cobra"
)

// bountyCmd represents the bounty command
var bountyCmd = &cobra.Command{
	Use:   "bounty",
	Short: "Create a new app bounty",
	Run:   bountyRun,
}

var (
	bountyName        string
	bountyImgLink     string
	bountyDescription string
	bountyDuration    int64
	bountyCodePath    string
)

func bountyRun(cmd *cobra.Command, args []string) {
	code, err := bountyLoadCode()
	if err != nil {
		log.Fatal(err)
	}
	durationSecs := time.Duration(bountyDuration) * time.Second
	deadline := time.Now().UTC().Add(durationSecs).Unix()
	input := &shared.CreateAppBounty{
		Name:          bountyName,
		ImgLink:       bountyImgLink,
		Description:   bountyDescription,
		Deadline:      deadline,
		CodeZipBinary: code,
	}
	sendInputAndPrintLogs(input)
}

func bountyLoadCode() (string, error) {
	// TODO
	return bountyCodePath, nil
}

func init() {
	sendCmd.AddCommand(bountyCmd)

	bountyCmd.Flags().StringVarP(
		&bountyName, "name", "n", "", "App name")
	bountyCmd.MarkFlagRequired("name")

	bountyCmd.Flags().StringVarP(
		&bountyImgLink, "image", "i", "", "App image")
	bountyCmd.MarkFlagRequired("image")

	bountyCmd.Flags().StringVarP(
		&bountyDescription, "description", "d", "", "App description")
	bountyCmd.MarkFlagRequired("description")

	bountyCmd.Flags().Int64Var(
		&bountyDuration, "duration", 24*60*60, "duration of the bounty in secods")

	bountyCmd.Flags().StringVarP(
		&bountyCodePath, "code", "c", "", "Path to the code zip")
	bountyCmd.MarkFlagRequired("code")
}
