import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "./__generated__/gql";
import { GetVouchersQuery } from "./__generated__/graphql";
import { BugBusterState, AppBounty, BountyType } from "./state";
import { Validity, Proof, Voucher } from "../utils/voucher";
import { InputInfo } from "./inputs";
import { Hex, isHex, hexToBytes, isAddress, isHash } from "viem";

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

const GET_INPUT = gql(/* GraphQL */ `
    query getInput($inputIndex: Int!) {
        input(index: $inputIndex) {
            payload
            status
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

const POLL_INTERVAL = 2000; // ms

// Create a stateful variable for a reader result
function useReaderResult<T>() {
    return useState<ReaderResult<T>>({ kind: "loading" });
}

export const parseHexAsJson = (hex: Hex) => {
    const bytes = hexToBytes(hex);
    const buffer = Buffer.from(bytes);
    const str = buffer.toString("utf-8");
    try {
        return JSON.parse(str);
    } catch (e) { }
};

export const parseStringAsJson = (str: string) => {
    if (isHex(str)) {
        return parseHexAsJson(str);
    }
};

function isBugBusterState(state: any): state is BugBusterState {
    return state !== undefined && "bounties" in state;
}

export const useLatestState = () => {
    const [result, setResult] = useReaderResult<BugBusterState>();
    const { data, loading, error } = useQuery(GET_LAST_REPORTS, {
        pollInterval: POLL_INTERVAL,
    });

    useEffect(() => {
        if (loading) {
            setResult({ kind: "loading" });
        } else if (error !== undefined) {
            setResult({ kind: "error", message: error.message });
        } else if (data !== undefined) {
            const lastEdge = data.reports.edges.findLast((edge) => {
                const state = parseStringAsJson(edge.node.payload);
                return isBugBusterState(state);
            });
            if (lastEdge === undefined) {
                const initialState: BugBusterState = { bounties: [] };
                setResult({ kind: "success", response: initialState });
            } else {
                const state = parseStringAsJson(lastEdge.node.payload);
                if (isBugBusterState(state)) {
                    setResult({ kind: "success", response: {...state, bounties: state.bounties.map((bounty, index) => {
                        return {...bounty, bountyIndex: index};
                    })} });
                }
            }
        }
    }, [data, loading, error, setResult]);

    return result;
};

export const useBounty = (bountyIndex: number) => {
    const [result, setResult] = useReaderResult<AppBounty>();
    const stateResult = useLatestState();

    useEffect(() => {
        if (isNaN(bountyIndex)) {
            setResult({
                kind: "error",
                message: "Bounty index is not a number",
            });
        } else {
            if (stateResult.kind == "success") {
                const state = stateResult.response;
                const bounty = state.bounties.at(bountyIndex);
                if (bounty !== undefined) {
                    setResult({ kind: "success", response: bounty });
                } else {
                    setResult({ kind: "error", message: "Bounty not found" });
                }
            } else {
                setResult(stateResult);
            }
        }
    }, [bountyIndex, stateResult, setResult]);

    return result;
};

export const isInput = (
    input: any,
): input is { kind: string; payload: any } => {
    return (
        input !== undefined &&
        "kind" in input &&
        typeof input.kind === "string" &&
        "payload" in input
    );
};

export const useInput = (inputIndex?: number) => {
    const [result, setResult] = useReaderResult<InputInfo>();
    const { data, loading, error } = useQuery(GET_INPUT, {
        pollInterval: POLL_INTERVAL,
        variables: inputIndex !== undefined ? { inputIndex } : undefined,
    });

    useEffect(() => {
        if (loading) {
            setResult({ kind: "loading" });
        } else if (error !== undefined) {
            setResult({ kind: "error", message: error.message });
        } else if (data !== undefined) {
            const { status, payload } = data.input;
            if (isHex(payload)) {
                setResult({ kind: "success", response: { status, payload } });
            } else {
                setResult({
                    kind: "error",
                    message: "Malformed input payload",
                });
            }
        }
    }, [data, loading, error, setResult]);

    return result;
};

type VoucherFromQuery = GetVouchersQuery["vouchers"]["edges"][number]["node"];
type ProofFromQuery = NonNullable<VoucherFromQuery["proof"]>;
type ValidityFromQuery = ProofFromQuery["validity"];

const isValidity = (validity: ValidityFromQuery): validity is Validity => {
    const {
        inputIndexWithinEpoch,
        outputIndexWithinInput,
        outputHashesRootHash,
        vouchersEpochRootHash,
        noticesEpochRootHash,
        machineStateHash,
        outputHashInOutputHashesSiblings,
        outputHashesInEpochSiblings,
    } = validity;

    return (
        !isNaN(inputIndexWithinEpoch) &&
        !isNaN(outputIndexWithinInput) &&
        isHash(outputHashesRootHash) &&
        isHash(vouchersEpochRootHash) &&
        isHash(noticesEpochRootHash) &&
        isHash(machineStateHash) &&
        outputHashInOutputHashesSiblings.every(isHash) &&
        outputHashesInEpochSiblings.every(isHash)
    );
};

const isProof = (proof: ProofFromQuery): proof is Proof => {
    const { context, validity } = proof;
    return isHex(context) && isValidity(validity);
};

const isVoucher = (voucher: VoucherFromQuery): voucher is Voucher => {
    const { destination, payload, proof } = voucher;
    return (
        isAddress(destination) && isHex(payload) && (!proof || isProof(proof))
    );
};

export const useVouchers = () => {
    const [result, setResult] = useReaderResult<Voucher[]>();
    const { data, loading, error } = useQuery(GET_VOUCHERS, {
        pollInterval: POLL_INTERVAL,
    });

    useEffect(() => {
        if (loading) {
            setResult({ kind: "loading" });
        } else if (error !== undefined) {
            setResult({ kind: "error", message: error.message });
        } else if (data !== undefined) {
            const vouchers = data.vouchers.edges.map((edge) => edge.node);
            if (vouchers.every(isVoucher)) {
                setResult({ kind: "success", response: vouchers });
            } else {
                setResult({ kind: "error", message: "Malformed vouchers" });
            }
        }
    }, [data, loading, error, setResult]);

    return result;
};
