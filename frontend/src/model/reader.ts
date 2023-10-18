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

function getLastAcceptedInputIndex(): ReaderResult<number | undefined> {
  const { loading, error, data } = useQuery(GET_LAST_INPUTS, {
    variables: {},
  });
  if (loading) return { state: "loading" };
  if (error) return { state: "error", message: error.message };

  console.log(data);
  if (data?.inputs?.totalCount === 0) {
    return { state: "success", response: undefined };
  }
  let edge = data?.inputs?.edges.findLast(
    (e) => e.node.status === CompletionStatus.Accepted,
  );
  let index = edge?.node.index;
  return { state: "success", response: index };
}

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

function GetLatestState(): ReaderResult<BugLessState> {
  let result = getLastAcceptedInputIndex();

  // We should only return after useQuery to avoid the "Rendered more hooks
  // than during the previous render" error. Hence, we initialize the input
  // index here.
  let inputIndex = 0;
  if (result.state == "success") {
    if (result.response !== undefined) {
      inputIndex = result.response;
    }
  }

  const { loading, error, data } = useQuery(GET_INPUT, {
    variables: { inputIndex },
  });
  if (result.state != "success") return result;
  if (loading) return { state: "loading" };
  if (error) return { state: "error", message: error.message };

  let reportEdge = data?.input.reports.edges.find((edge) =>
    edge.node.payload.startsWith("0x01"),
  );
  if (reportEdge === undefined) {
    // This should never happen because the input was accepted.
    return { state: "error", message: "missing state from accepted input" };
  }

  // Check codec encoding.
  if (!reportEdge.node.payload.startsWith("0x0157896b8c")) {
    return { state: "error", message: "wrong codec in report" };
  }

  let stateBytes = fromHexString(reportEdge.node.payload.substring(12));
  if (stateBytes === null) {
    return { state: "error", message: "failed to decode report hex" };
  }
  let stateText = new TextDecoder().decode(stateBytes);
  let stateJson = JSON.parse(stateText) as BugLessState;

  return { state: "success", response: stateJson };
}

function fromHexString(hexString: string): Uint8Array | null {
  let match = hexString.match(/.{1,2}/g);
  if (match === null) {
    return null;
  }
  return Uint8Array.from(match.map((byte) => parseInt(byte, 16)));
}

export { GetLatestState };
