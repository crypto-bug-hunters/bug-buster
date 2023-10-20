import { AppBounty } from "../model/state";

export enum BountyStatus {
    ACTIVE,
    EXPLOITED,
    EXPIRED,
}

export function getBountyStatus(bounty: AppBounty): BountyStatus {
    if (bounty.Exploit) return BountyStatus.EXPLOITED;

    const dateDiff = bounty.Deadline * 1000 - new Date().getTime();

    if (dateDiff < 0) return BountyStatus.EXPIRED;

    return BountyStatus.ACTIVE;
}
