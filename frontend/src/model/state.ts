import { Address, Hex } from "viem";

export interface BugBusterState {
    bounties: AppBounty[];
}

export enum BountyType {
    Bug,
    RLModel
}

export interface AppBounty {
    name: string;
    bountyType: BountyType;
    imgLink?: string;
    description: string;
    deadline: number;
    token: Address;
    sponsorships: Sponsorship[] | null;
    solution: Solution | null;
    withdrawn: boolean;
    attempts: Array<Solution>;
    modelEnvironment: string | null;
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

export interface Solution {
    hacker: Profile;
    inputIndex: number;
}

export interface Sponsorship {
    sponsor: Profile;
    value: Hex;
}
