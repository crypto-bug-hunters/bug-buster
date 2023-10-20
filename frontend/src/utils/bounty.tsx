import { AppBounty } from "../model/state";

export enum BountyStatus {
    ACTIVE,
    EXPLOITED,
    EXPIRED,
}

export function getBountyStatus(bounty: AppBounty, timestamp: BigInt): BountyStatus {
    if (bounty.Exploit) {
        return BountyStatus.EXPLOITED;
    } else if (timestamp < bounty.Deadline) {
        return BountyStatus.ACTIVE;
    } else {
        return BountyStatus.EXPIRED;
    }
}
