import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "./__generated__/gql";
import { CompletionStatus } from "./__generated__/graphql";
import { BugLessState } from "./index";

type ReaderLoadingResult = {
  state: "loading";
};

type ReaderErrorResult = {
  state: "error";
  message: string;
};

type ReaderSuccessResult<T> = {
  state: "success";
  response: T;
};

type ReaderResult<T> =
  | ReaderLoadingResult
  | ReaderErrorResult
  | ReaderSuccessResult<T>;

const GET_LAST_REPORTS = gql(/* GraphQL */ `
  query getLastReports {
    reports(last: 1000) {
      edges {
        node {
          payload
        }
      }
    }
  }
`);

const GET_INPUT = gql(/* GraphQL */ `
  query getInput($inputIndex: Int!) {
    input(index: $inputIndex) {
      status
      payload
      msgSender
      timestamp
      blockNumber
      vouchers {
        edges {
          node {
            index
            destination
            payload
          }
        }
      }
      reports {
        edges {
          node {
            index
            payload
          }
        }
      }
    }
  }
`);

// Get the latest bug less state from the GraphQL API polling the API every 500 ms.
function GetLatestState(): ReaderResult<BugLessState | null> {
  const { data, loading, error } = useQuery(GET_LAST_REPORTS, {
    pollInterval: 500, // ms
  });
  if (loading) return { state: "loading" };
  if (error) return { state: "error", message: error.message };
  let reportEdge = data?.reports.edges.find((edge) =>
    edge.node.payload.startsWith("0x0157896b8c")
  );
  let payload = reportEdge?.node.payload;
  let stateBytes = fromHexString(payload?.substring(12));
  let stateJson = null;
  if (stateBytes !== undefined) {
    let stateText = new TextDecoder().decode(stateBytes);
    stateJson = JSON.parse(stateText) as BugLessState;
  }
  return { state: "success", response: stateJson };
}

function IsInputReady(inputIndex: number): ReaderResult<boolean> {
  const { data, loading, error } = useQuery(GET_INPUT, {
    pollInterval: 500, // ms
    variables: {
      inputIndex,
    },
  });
  if (loading) return { state: "loading" };
  if (error) {
    if (error.message === "input not found")
      return { state: "success", response: false };
    return { state: "error", message: error.message };
  }
  const ready = data?.input.status == CompletionStatus.Accepted;
  return { state: "success", response: ready };
}

function fromHexString(hexString: string | undefined): Uint8Array | undefined {
  if (hexString === undefined) {
    return undefined;
  }
  let match = hexString.match(/.{1,2}/g);
  if (match === null) {
    return undefined;
  }
  return Uint8Array.from(match.map((byte) => parseInt(byte, 16)));
}

export { GetLatestState, IsInputReady };
