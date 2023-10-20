import { FC } from "react";
import { AppBounty } from "../model/state";
import { BountyStatus, getBountyStatus } from "../utils/bounty";
import { Badge } from "@mantine/core";

export const BountyStatusBadge: FC<{ bounty: AppBounty }> = ({ bounty }) => {
    const status: BountyStatus = getBountyStatus(bounty);

    return (
        <>
            {status === BountyStatus.ACTIVE && (
                <>
                    <Badge color="green">Active</Badge>
                </>
            )}
            {status === BountyStatus.EXPIRED && (
                <>
                    <Badge color="gray">Expired</Badge>
                </>
            )}
            {status === BountyStatus.EXPLOITED && (
                <>
                    <Badge color="red">Exploited</Badge>
                </>
            )}
        </>
    );
};
