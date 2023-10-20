"use client";
import { FC } from "react";
import { formatEther } from "viem";

interface EtherValueParams {
    wei: string;
}

export const EtherValue: FC<EtherValueParams> = ({ wei }) => {
    return formatEther(BigInt(wei)) + " ETH";
};
