import { Address, Hex } from "viem";

export interface BugBusterState {
    bounties: AppBounty[];
}

export interface AppBounty {
    name: string;
    imgLink?: string;
    description: string;
    deadline: number;
    token: Address;
    sponsorships: Sponsorship[] | null;
    exploit: Exploit | null;
    withdrawn: boolean;
}

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
