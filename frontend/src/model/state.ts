export interface BugLessState {
    Bounties: AppBounty[];
}

export interface AppBounty {
    Developer: Profile; // Name and ImgLink are related to the App
    Description: string;
    Started: number;
    Deadline: number;
    InputIndex: number;
    Sponsorships?: Sponsorship[];
    Exploit?: Exploit;
    Withdrawn: boolean;
}

export const getBountyTotalPrize = (bounty: AppBounty) => {
    if (bounty.Sponsorships) {
        // prettier-ignore
        return bounty.Sponsorships
            .map((s) => BigInt(s.Value))
            .reduce((acc, v) => acc + v);
    } else {
        return BigInt(0);
    }
};

export interface Profile {
    Address: string;
    Name: string;
    ImgLink?: string;
}

export interface Exploit {
    Hacker: Profile;
    InputIndex: number;
    Code: string;
}

export interface Sponsorship {
    Sponsor: Profile;
    Value: string; // number encoded as hex string
}

export interface SendExploit {
    bountyIndex: number;
    name: string;
    imgLink: string;
    exploit: string;
}

export interface SendExploitInput {
    kind: string;
    payload: SendExploit;
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
