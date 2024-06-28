import { formatUnits, Address, zeroAddress } from "viem";
import { Code, HoverCard } from "@mantine/core";

import {
    useErc20Symbol,
    useErc20Decimals,
    useErc20BalanceOf,
    useErc20Allowance,
} from "../hooks/contracts";

export interface Erc20Metadata {
    symbol?: string;
    decimals?: number;
}

export const useErc20Metadata = (address: Address): Erc20Metadata => {
    const { data: symbol } = useErc20Symbol({ address });
    const { data: decimals } = useErc20Decimals({ address });
    return { symbol, decimals };
};

export const formatErc20Amount = (
    address: Address,
    amount: bigint,
    { symbol, decimals }: Erc20Metadata,
) => {
    return (
        <>
            {formatUnits(amount, decimals ?? 0)}{" "}
            <HoverCard>
                <HoverCard.Target>
                    <span>{symbol ?? "tokens"}</span>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    Token address: <Code>{address}</Code>
                </HoverCard.Dropdown>
            </HoverCard>
        </>
    );
};

export interface Erc20UserDataOptions {
    user?: Address;
    spender?: Address;
    watch?: boolean;
}

export interface Erc20UserData {
    balance?: bigint;
    allowance?: bigint;
}

export const useErc20UserData = (
    address: Address,
    opts: Erc20UserDataOptions,
): Erc20UserData => {
    const { user, spender, watch } = opts;
    const { data: balance } = useErc20BalanceOf({
        address,
        args: [user ?? zeroAddress],
        enabled: user !== undefined,
        watch,
    });
    const { data: allowance } = useErc20Allowance({
        address,
        args: [user ?? zeroAddress, spender ?? zeroAddress],
        enabled: user !== undefined && spender !== undefined,
        watch,
    });
    return { balance, allowance };
};
