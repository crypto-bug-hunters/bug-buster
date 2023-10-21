import { FC } from "react";
import { BountyStatus } from "../utils/bounty";
import { Group, Badge } from "@mantine/core";

interface BountyStatusBadgeInfo {
    color: string;
    label: string;
}

function getCurrentUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

export const getBountyStatusBadgeInfo = (
    bountyStatus: BountyStatus,
    bountyDeadline: number,
) => {
    switch (bountyStatus) {
        case BountyStatus.OPEN:
            return {
                color: "green",
                label: "Open",
            };
        case BountyStatus.EXPIRED:
            return {
                color: "gray",
                label: "Expired",
            };
        case BountyStatus.EXPLOITED:
            return {
                color: "red",
                label: "Exploited",
            };
        default:
            throw new Error("Unknown bounty status");
    }
};

export const BountyStatusBadge: FC<{
    bountyStatus: BountyStatus;
    bountyDeadline: number;
}> = ({ bountyStatus, bountyDeadline }) => {
    const { color, label } = getBountyStatusBadgeInfo(
        bountyStatus,
        bountyDeadline,
    );
    const daysLeft = Math.ceil(
        (bountyDeadline - getCurrentUnixTimestamp()) / (24 * 3600),
    );
    return (
        <Group>
            <Badge color={color}>{label}</Badge>
            {bountyStatus == BountyStatus.OPEN && daysLeft > 0 && (
                <Badge color="blue">ends in {daysLeft} days</Badge>
            )}
        </Group>
    );
};
