export interface BugBusterState {
    bounties: AppBounty[];
}

export interface AppBounty {
    name: string;
    imgLink?: string;
    description: string;
    deadline: number;
    sponsorships?: Sponsorship[];
    exploit?: Exploit;
    withdrawn: boolean;
}

export const getBountyTotalPrize = (bounty: AppBounty) => {
    if (bounty.sponsorships) {
        // prettier-ignore
        return bounty.sponsorships
            .map((s) => BigInt(s.value))
            .reduce((acc, v) => acc + v);
    } else {
        return BigInt(0);
    }
};

export interface Profile {
    address: string;
    name: string;
    imgLink?: string;
}

export interface Exploit {
    hacker: Profile;
    inputIndex: number;
    code: string;
}

export interface Sponsorship {
    sponsor: Profile;
    value: string; // number encoded as hex string
}

export interface Voucher {
    index: number;
    input: { index: number };
    destination: string;
    payload: string;
    proof?: {
        context: string;
        validity: {
            inputIndexWithinEpoch: number;
            outputIndexWithinInput: number;
            outputHashesRootHash: string;
            vouchersEpochRootHash: string;
            noticesEpochRootHash: string;
            machineStateHash: string;
            outputHashInOutputHashesSiblings: string[];
            outputHashesInEpochSiblings: string[];
        };
    };
}
