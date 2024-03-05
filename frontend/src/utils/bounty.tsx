import { AppBounty } from "../model/state";
import { BountyStatus } from "../model/bountyStatus";

const secondsToDays = (seconds: bigint) => {
    const secondsInOneDay = BigInt(60 * 60 * 24);
    return (seconds + secondsInOneDay - BigInt(1)) / secondsInOneDay;
};

export function getBountyStatus(
    bounty: AppBounty,
    blockTimestamp?: bigint,
): BountyStatus {
    if (bounty.Exploit) {
        return { kind: "exploited" };
    } else if (blockTimestamp === undefined) {
        return { kind: "loading" };
    } else {
        const secondsLeft = BigInt(bounty.Deadline) - blockTimestamp;
        if (secondsLeft > 0) {
            const daysLeft = secondsToDays(secondsLeft);
            return { kind: "open", daysLeft: daysLeft };
        } else {
            return { kind: "expired" };
        }
    }
}
