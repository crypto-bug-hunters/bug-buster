import { Hex } from "viem";

import { CompletionStatus } from "./__generated__/graphql";

export interface CreateAppBounty {
    name: string;
    description: string;
    imgLink?: string;
    deadline: number;
    codeZipBinary?: string;
    codeZipPath?: string;
}

export interface AddSponsorship {
    name: string;
    imgLink?: string;
    bountyIndex: number;
}

export interface SendExploit {
    name: string;
    imgLink?: string;
    bountyIndex: number;
    exploit: string;
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
    | TaggedInput<"SendExploit", SendExploit>
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
