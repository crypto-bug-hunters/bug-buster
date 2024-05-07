import { FC } from "react";
import { BountyStatus } from "../model/bountyStatus";
import { Group, Badge } from "@mantine/core";

interface BadgeDescriptor {
    color: string;
    label: string;
}

const getBadgeDescriptors = (bountyStatus: BountyStatus): BadgeDescriptor[] => {
    switch (bountyStatus.kind) {
        case "loading":
            return [];
        case "open":
            return [
                {
                    color: "green",
                    label: "Open",
                },
                {
                    color: "blue",
                    label: `Ends in ${bountyStatus.daysLeft} days`,
                },
            ];
        case "expired":
            return [
                {
                    color: "gray",
                    label: "Expired",
                },
            ];
        case "exploited":
            return [
                {
                    color: "red",
                    label: "Exploited",
                },
            ];
        default:
            throw new Error("Unknown bounty status");
    }
};

export const BountyStatusBadgeGroup: FC<{
    bountyStatus: BountyStatus;
}> = ({ bountyStatus }) => {
    const badgeDescriptors = getBadgeDescriptors(bountyStatus);
    return (
        <Group>
            {badgeDescriptors.map(({ color, label }, index) => {
                return (
                    <Badge key={index} color={color}>
                        {label}
                    </Badge>
                );
            })}
        </Group>
    );
};
