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
    AdvanceRequest,
} from "../model/inputs";
import { getDAppAddress } from "../utils/address";

function encodeAdvanceRequest(advanceRequest: AdvanceRequest): Hex {
    return toHex(new TextEncoder().encode(JSON.stringify(advanceRequest)));
}

function usePrepareBugBusterInput(advanceRequest: AdvanceRequest) {
    const { config } = usePrepareInputBoxAddInput({
        args: [getDAppAddress(), encodeAdvanceRequest(advanceRequest)],
        enabled: true,
    });

    return config;
}

function usePrepareBugBusterETHDeposit(
    advanceRequest: AdvanceRequest,
    valueInWei: bigint,
) {
    const { config } = usePrepareEtherPortalDepositEther({
        args: [getDAppAddress(), encodeAdvanceRequest(advanceRequest)],
        value: valueInWei,
        enabled: true,
    });

    return config;
}

export function usePrepareCreateBounty(bounty: CreateAppBounty) {
    return usePrepareBugBusterInput({
        kind: "CreateAppBounty",
        payload: bounty,
    });
}

export function usePrepareAddSponsorship(
    sponsorship: AddSponsorship,
    value: bigint,
) {
    return usePrepareBugBusterETHDeposit(
        { kind: "AddSponsorship", payload: sponsorship },
        value,
    );
}

export function usePrepareSendExploit(exploit: SendExploit) {
    return usePrepareBugBusterInput({ kind: "SendExploit", payload: exploit });
}

export function usePrepareWithdrawSponsorship(
    withdrawSponsorship: WithdrawSponsorship,
) {
    return usePrepareBugBusterInput({
        kind: "WithdrawSponsorship",
        payload: withdrawSponsorship,
    });
}
