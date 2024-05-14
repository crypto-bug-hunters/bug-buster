export interface CreateAppBounty {
    name: string;
    description: string;
    imgLink?: string;
    deadline: number;
    codeZipBinary?: string;
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

export type Input =
    | TaggedInput<"CreateAppBounty", CreateAppBounty>
    | TaggedInput<"AddSponsorship", AddSponsorship>
    | TaggedInput<"SendExploit", SendExploit>
    | TaggedInput<"WithdrawSponsorship", WithdrawSponsorship>;
