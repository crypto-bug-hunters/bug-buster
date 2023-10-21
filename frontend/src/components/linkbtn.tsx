"use client";
import { FC, ReactNode } from "react";

import { Button } from "@mantine/core";

import { formatEther } from "viem";

import { GetBounty } from "../../../model/reader";
import { Exploit, getBountyTotalPrize, AppBounty } from "../../../model/state";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bugless";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, InvalidBountyId } from "./utils";
import { useBlockTimestamp } from "../../../hooks/block";
import { BountyStatus, getBountyStatus } from "../../../utils/bounty";
import { BountyStatusBadge } from "../../../components/bountyStatus";
import { useWaitForTransaction } from "wagmi";
import { Profile } from "../../../components/profile";

interface LinkButtonParams {
    href: string;
    disabled?: boolean;
    children: ReactNode;
}

export const LinkButton: FC<LinkButtonParams> = ({
    href,
    disabled,
    children,
}) => {
    return (
        <Button
            component="a"
            href={href}
            data-disabled={disabled}
            onClick={disabled ? (event) => event.preventDefault() : null}
        >
            {children}
        </Button>
    );
};
