import { FC } from "react";
import { AppBounty } from "../model/state";
import { BountyStatus, getBountyStatus } from "../utils/bounty";
import { ThemeIcon, Tooltip } from "@mantine/core";
import {
    IconDiscountCheck,
    IconDiscountOff,
    IconBombFilled,
} from "@tabler/icons-react";

export const BountyStatusBadge: FC<{ bounty: AppBounty }> = ({ bounty }) => {
    const status: BountyStatus = getBountyStatus(bounty);

    return (
        <ThemeIcon>
            {status === BountyStatus.ACTIVE && (
                <>
                    <Tooltip label={"Active"} withArrow position="right">
                        <IconDiscountCheck />
                    </Tooltip>
                </>
            )}
            {status === BountyStatus.EXPIRED && (
                <>
                    <Tooltip label={"Expired"} withArrow position="right">
                        <IconDiscountOff />
                    </Tooltip>
                </>
            )}
            {status === BountyStatus.EXPLOITED && (
                <>
                    <Tooltip label={"Exploited"} withArrow position="right">
                        <IconBombFilled />
                    </Tooltip>
                </>
            )}
        </ThemeIcon>
    );
};
