import { Address, Hex } from "viem";

import { CompletionStatus } from "./__generated__/graphql";

export interface CreateAppBounty {
    name: string;
    description: string;
    imgLink?: string;
    deadline: number;
    codeZipBinary?: string;
    codeZipPath?: string;
    token: Address;
}

export interface AddSponsorship {
    name: string;
    imgLink?: string;
    bountyIndex: number;
}

export interface SendSolution {
    name: string;
    imgLink?: string;
    bountyIndex: number;
    solution: string;
}

export interface WithdrawSponsorship {
    bountyIndex: number;
}

export interface TaggedInput<K, T> {
    kind: K;
    payload: T;
}

export type AdvanceRequest =
    | TaggedInput<"CreateAppBounty", CreateAppBounty>
    | TaggedInput<"AddSponsorship", AddSponsorship>
    | TaggedInput<"SendSolution", SendSolution>
    | TaggedInput<"WithdrawSponsorship", WithdrawSponsorship>;

export interface InputInfo {
    payload: Hex;
    status: CompletionStatus;
}

export interface TestExploit {
    bountyIndex: number;
    exploit: string;
}

export type InspectRequest = TestExploit;
