import { Address, Hex } from "viem";

export interface BugBusterState {
    bounties: AppBounty[];
}

export interface AppBounty {
    name: string;
    imgLink?: string;
    description: string;
    deadline: number;
    sponsorships: Sponsorship[] | null;
    exploit: Exploit | null;
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
    address: Address;
    name: string;
    imgLink?: string;
}

export interface Exploit {
    hacker: Profile;
    inputIndex: number;
}

export interface Sponsorship {
    sponsor: Profile;
    value: Hex;
}
