import { FC } from "react";
import { BountyStatus } from "../utils/bounty";
import { Badge } from "@mantine/core";

interface BountyStatusBadgeInfo {
    color: string;
    label: string;
}

const getBountyStatusBadgeInfo = (status) => {
    switch (status) {
        case BountyStatus.ACTIVE:
            return {
                color: "green",
                label: "Active",
            }
        case BountyStatus.EXPIRED:
            return {
                color: "gray",
                label: "Expired",
            }
        case BountyStatus.EXPLOITED:
            return {
                color: "red",
                label: "Exploited",
            }
        default:
            throw new Error("Unknown status");
    }
};

export const BountyStatusBadge: FC<{ status: BountyStatus }> = ({ status }) => {
    const { color, label } = getBountyStatusBadgeInfo(status);
    return (
        <Badge color={color}>
            {label}
        </Badge>
    );
};
