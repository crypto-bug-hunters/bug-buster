import { useQuery } from "@apollo/client";
import { gql } from "./__generated__/gql";
import { CompletionStatus } from "./__generated__/graphql";
import { BugLessState, AppBounty, Voucher } from "./state";
import { TaggedInput, SendExploit } from "./inputs";

type ReaderLoadingResult = {
    kind: "loading";
};

type ReaderErrorResult = {
    kind: "error";
    message: string;
};

type ReaderSuccessResult<T> = {
    kind: "success";
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

const GET_VOUCHERS = gql(/* GraphQL */ `
    query getVouchers {
        vouchers {
            edges {
                node {
                    index
                    input {
                        index
                    }
                    destination
                    payload
                    proof {
                        context
                        validity {
                            inputIndexWithinEpoch
                            machineStateHash
                            noticesEpochRootHash
                            outputHashInOutputHashesSiblings
                            outputHashesInEpochSiblings
                            outputHashesRootHash
                            outputIndexWithinInput
                            vouchersEpochRootHash
                        }
                    }
                }
            }
        }
    }
`);

// Get the latest bug less state from the GraphQL API polling the API every 500 ms.
function GetLatestState(): ReaderResult<BugLessState> {
    const { data, loading, error } = useQuery(GET_LAST_REPORTS, {
        pollInterval: 500, // ms
    });
    if (loading) return { kind: "loading" };
    if (error) return { kind: "error", message: error.message };
    let reportEdge = data?.reports.edges.findLast((edge) =>
        // starts with {"Bounties":
        edge.node.payload.startsWith("0x7b22426f756e74696573223a"),
    );
    let payload = reportEdge?.node.payload;
    let stateBytes = fromHexString(payload?.substring(2)); // remove '0x'
    let stateJson = null;
    if (stateBytes !== undefined) {
        let stateText = new TextDecoder().decode(stateBytes);
        stateJson = JSON.parse(stateText) as BugLessState;
    } else {
        stateJson = { Bounties: [] };
    }
    return { kind: "success", response: stateJson };
}

// Get the details for the given bounty including the exploit code.
function GetBounty(bountyIndex: number): ReaderResult<AppBounty> {
    const reportsQuery = useQuery(GET_LAST_REPORTS, {
        pollInterval: 500, // ms
    });
    let reportEdge = reportsQuery.data?.reports.edges.findLast((edge) =>
        // starts with {"Bounties":
        edge.node.payload.startsWith("0x7b22426f756e74696573223a"),
    );
    let payload = reportEdge?.node.payload;
    let stateBytes = fromHexString(payload?.substring(2)); // remove '0x'
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
    let SendExploitInputBytes = fromHexString(
        exploitQuery.data?.input.payload?.substring(2), // remove '0x'
    );
    if (exploit && SendExploitInputBytes) {
        let SendExploitInputText = new TextDecoder().decode(
            SendExploitInputBytes,
        );
        let SendExploitInput = JSON.parse(SendExploitInputText) as TaggedInput<
            "SendExploit",
            SendExploit
        >;
        exploit.Code = atob(SendExploitInput.payload.exploit);
    }

    if (reportsQuery.loading) return { kind: "loading" };
    if (reportsQuery.error)
        return { kind: "error", message: reportsQuery.error.message };

    if (exploitQuery.loading) return { kind: "loading" };
    if (exploitQuery.error)
        return { kind: "error", message: exploitQuery.error.message };

    if (bounty === undefined) {
        return { kind: "error", message: "bounty not found" };
    }

    return { kind: "success", response: bounty };
}

// Get whether the given input is ready.
function IsInputReady(inputIndex: number): ReaderResult<boolean> {
    const { data, loading, error } = useQuery(GET_INPUT_STATUS, {
        pollInterval: 500, // ms
        variables: {
            inputIndex,
        },
    });
    if (loading) return { kind: "loading" };
    if (error) {
        if (error.message === "input not found")
            return { kind: "success", response: false };
        return { kind: "error", message: error.message };
    }
    const ready = data?.input.status == CompletionStatus.Accepted;
    return { kind: "success", response: ready };
}

// Get whether the given input is ready.
function GetVouchers(): ReaderResult<Voucher[]> {
    const { data, loading, error } = useQuery(GET_VOUCHERS, {
        pollInterval: 1000, // ms - TODO Check this and other poll intervals to avoid consuming all API request from RPC provider
    });
    if (loading) return { kind: "loading" };
    if (error) {
        return { kind: "error", message: error.message };
    }

    const vouchers: Voucher[] = data?.vouchers.edges?.map(
        (edge) => edge.node,
    ) as Voucher[];

    return { kind: "success", response: vouchers };
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

export { GetLatestState, GetBounty, IsInputReady, GetVouchers };
