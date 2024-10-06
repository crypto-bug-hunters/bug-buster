import { toHex, Hex, Address } from "viem";
import {
    usePrepareErc20PortalDepositErc20Tokens,
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
    return usePrepareInputBoxAddInput({
        args: [getDAppAddress(), encodeAdvanceRequest(advanceRequest)],
    });
}

function usePrepareBugBusterErc20Deposit(
    advanceRequest: AdvanceRequest,
    token: Address,
    value: bigint,
) {
    return usePrepareErc20PortalDepositErc20Tokens({
        args: [
            token,
            getDAppAddress(),
            value,
            encodeAdvanceRequest(advanceRequest),
        ],
    });
}

export function usePrepareCreateBounty(bounty: CreateAppBounty) {
    return usePrepareBugBusterInput({
        kind: "CreateAppBounty",
        payload: bounty,
    });
}

export function usePrepareAddSponsorship(
    sponsorship: AddSponsorship,
    token: Address,
    value: bigint,
) {
    return usePrepareBugBusterErc20Deposit(
        { kind: "AddSponsorship", payload: sponsorship },
        token,
        value,
    );
}

export function usePrepareSendExploit(exploit: SendExploit) {
    return usePrepareBugBusterInput({ kind: "SendSolution", payload: exploit });
}

export function usePrepareWithdrawSponsorship(
    withdrawSponsorship: WithdrawSponsorship,
) {
    return usePrepareBugBusterInput({
        kind: "WithdrawSponsorship",
        payload: withdrawSponsorship,
    });
}
