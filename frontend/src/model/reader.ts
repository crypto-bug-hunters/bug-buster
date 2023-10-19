import { useQuery } from "@apollo/client";
import { gql } from "./__generated__/gql";
import { CompletionStatus } from "./__generated__/graphql";
import { BugLessState, AppBounty, SendExploit } from "./state";

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

const GET_INPUT_STATUS = gql(/* GraphQL */ `
  query getInputStatus($inputIndex: Int!) {
    input(index: $inputIndex) {
      status
    }
  }
`);

const GET_INPUT_PAYLOAD = gql(/* GraphQL */ `
  query getInputPayload($inputIndex: Int!) {
    input(index: $inputIndex) {
      payload
    }
  }
`);

// Get the latest bug less state from the GraphQL API polling the API every 500 ms.
function GetLatestState(): ReaderResult<BugLessState> {
  const { data, loading, error } = useQuery(GET_LAST_REPORTS, {
    pollInterval: 500, // ms
  });
  if (loading) return { state: "loading" };
  if (error) return { state: "error", message: error.message };
  let reportEdge = data?.reports.edges.findLast((edge) =>
    edge.node.payload.startsWith("0x0157896b8c"),
  );
  let payload = reportEdge?.node.payload;
  let stateBytes = fromHexString(payload?.substring(12));
  let stateJson = null;
  if (stateBytes !== undefined) {
    let stateText = new TextDecoder().decode(stateBytes);
    stateJson = JSON.parse(stateText) as BugLessState;
  } else {
    stateJson = { Bounties: [] }
  }
  return { state: "success", response: stateJson };
}

// Get the details for the given bounty including the exploit code.
function GetBounty(bountyIndex: number): ReaderResult<AppBounty> {
  const reportsQuery = useQuery(GET_LAST_REPORTS, {
    pollInterval: 500, // ms
  });
  let reportEdge = reportsQuery.data?.reports.edges.findLast((edge) =>
    edge.node.payload.startsWith("0x0157896b8c"),
  );
  let payload = reportEdge?.node.payload;
  let stateBytes = fromHexString(payload?.substring(12));
  let stateJson = null;
  if (stateBytes !== undefined) {
    let stateText = new TextDecoder().decode(stateBytes);
    stateJson = JSON.parse(stateText) as BugLessState;
  }
  let bounty = stateJson?.Bounties.at(bountyIndex);
  let exploit = bounty?.Exploit;
  const exploitQuery = useQuery(GET_INPUT_PAYLOAD, {
    skip: !exploit?.InputIndex,
    variables: {
      inputIndex: exploit?.InputIndex as number, // this is fine because of skip
    },
  });
  let sendExploitBytes = fromHexString(
    exploitQuery.data?.input.payload?.substring(10),
  );
  if (exploit && sendExploitBytes) {
    let sendExploitText = new TextDecoder().decode(sendExploitBytes);
    let sendExploit = JSON.parse(sendExploitText) as SendExploit;
    exploit.Code = atob(sendExploit.Exploit);
  }

  if (reportsQuery.loading) return { state: "loading" };
  if (reportsQuery.error)
    return { state: "error", message: reportsQuery.error.message };

  if (exploitQuery.loading) return { state: "loading" };
  if (exploitQuery.error)
    return { state: "error", message: exploitQuery.error.message };

  if (bounty === undefined) {
    return { state: "error", message: "bounty not found" };
  }

  return { state: "success", response: bounty };
}

// Get whether the given input is ready.
function IsInputReady(inputIndex: number): ReaderResult<boolean> {
  const { data, loading, error } = useQuery(GET_INPUT_STATUS, {
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

export { GetLatestState, GetBounty, IsInputReady };
