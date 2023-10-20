import { AppBounty } from "../model/state";

export enum BountyStatus {
    OPEN,
    EXPLOITED,
    EXPIRED,
}

export function getBountyStatus(bounty: AppBounty, timestamp: bigint): BountyStatus {
    if (bounty.Exploit) {
        return BountyStatus.EXPLOITED;
    } else if (timestamp < bounty.Deadline) {
        return BountyStatus.OPEN;
    } else {
        return BountyStatus.EXPIRED;
    }
}
