import { Address, toHex } from "viem";
import { usePrepareInputBoxAddInput } from "./contracts";
import { CreateBounty } from "../model/inputs";

const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;

function usePrepareBuglessInput(opcode: number[], jsonContent: any) {
    const encondeJson: Uint8Array = new TextEncoder().encode(
        JSON.stringify(jsonContent),
    );
    const inputPayload: Uint8Array = new Uint8Array(encondeJson.length + 4);
    inputPayload.set(opcode);
    inputPayload.set(encondeJson, 4);

    const { config } = usePrepareInputBoxAddInput({
        args: [dapp, toHex(inputPayload)],
        enabled: true,
    });

    return config;
}

function usePrepareCreateBounty(bounty: CreateBounty) {
    return usePrepareBuglessInput([0x57, 0x92, 0x99, 0x3c], bounty);
}

export default usePrepareCreateBounty;
