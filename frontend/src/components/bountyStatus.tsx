import { FC } from "react";
import { BountyStatus } from "../utils/bounty";
import { Badge } from "@mantine/core";

interface BountyStatusBadgeInfo {
    color: string;
    label: string;
}

export const getBountyStatusBadgeInfo = (bountyStatus: BountyStatus) => {
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

export const BountyStatusBadge: FC<{ bountyStatus: BountyStatus }> = ({
    bountyStatus,
}) => {
    const { color, label } = getBountyStatusBadgeInfo(bountyStatus);
    return <Badge color={color}>{label}</Badge>;
};
