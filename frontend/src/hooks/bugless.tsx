import { toHex, Hex } from "viem";
import {
    usePrepareEtherPortalDepositEther,
    usePrepareInputBoxAddInput,
} from "./contracts";
import {
    AddSponsorship,
    CreateAppBounty,
    SendExploit,
    WithdrawSponsorship,
    Input,
} from "../model/inputs";
import { getDAppAddress } from "../utils/address";

function encodeInput(input: Input): Hex {
    return toHex(new TextEncoder().encode(JSON.stringify(input)));
}

function usePrepareBuglessInput(input: Input) {
    const { config } = usePrepareInputBoxAddInput({
        args: [getDAppAddress(), encodeInput(input)],
        enabled: true,
    });

    return config;
}

function usePrepareBuglessETHDeposit(input: Input, valueInWei: bigint) {
    const { config } = usePrepareEtherPortalDepositEther({
        args: [getDAppAddress(), encodeInput(input)],
        value: valueInWei,
        enabled: true,
    });

    return config;
}

export function usePrepareCreateBounty(bounty: CreateAppBounty) {
    return usePrepareBuglessInput({ kind: "CreateAppBounty", payload: bounty });
}

export function usePrepareAddSponsorship(
    sponsorship: AddSponsorship,
    value: bigint,
) {
    return usePrepareBuglessETHDeposit(
        { kind: "AddSponsorship", payload: sponsorship },
        value,
    );
}

export function usePrepareSendExploit(exploit: SendExploit) {
    return usePrepareBuglessInput({ kind: "SendExploit", payload: exploit });
}

export function usePrepareWithdrawSponsorship(
    withdrawSponsorship: WithdrawSponsorship,
) {
    return usePrepareBuglessInput({
        kind: "WithdrawSponsorship",
        payload: withdrawSponsorship,
    });
}
