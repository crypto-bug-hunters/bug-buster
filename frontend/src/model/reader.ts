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

const GET_LAST_INPUTS = gql(/* GraphQL */ `
  query getLastInputs {
    inputs(last: 1000) {
      totalCount
      edges {
        node {
          index
          status
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
  const lastInputsQuery = useQuery(GET_LAST_INPUTS, {
    pollInterval: 500, // ms
  });
  let edge = lastInputsQuery.data?.inputs?.edges.findLast(
    (e) => e.node.status === CompletionStatus.Accepted
  );
  let inputIndex = edge?.node.index;
  const inputQuery = useQuery(GET_INPUT, {
    skip: !inputIndex,
    variables: {
      inputIndex: inputIndex as number, // this cast is fine because of skip above
    },
  });
  let reportEdge = inputQuery.data?.input.reports.edges.find((edge) =>
    edge.node.payload.startsWith("0x01")
  );
  let payload = reportEdge?.node.payload;
  let stateBytes = fromHexString(payload?.substring(12));
  let stateJson = undefined
  if (stateBytes !== undefined) {
    let stateText = new TextDecoder().decode(stateBytes);
    stateJson = JSON.parse(stateText) as BugLessState;
  }
  if (lastInputsQuery.loading) return { state: "loading" };
  if (lastInputsQuery.error) {
    return { state: "error", message: lastInputsQuery.error.message };
  }
  if (inputQuery.loading) return { state: "loading" };
  if (inputQuery.error) {
    return { state: "error", message: inputQuery.error.message };
  }

  if (inputIndex === null) {
    return { state: "success", response: null };
  }

  if (stateJson === undefined) {
    // This should never happen because the input was accepted.
    return { state: "error", message: "missing return from accepted input" };
  }

  if (!payload?.startsWith("0x0157896b8c")) {
    // Check codec encoding.
    return { state: "error", message: "wrong codec in report" };
  }

  return { state: "success", response: stateJson };
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

export { GetLatestState };
