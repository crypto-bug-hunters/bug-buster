import { Address, toHex } from "viem";
import { usePrepareEtherPortalDepositEther, usePrepareInputBoxAddInput } from "./contracts";
import { AddSponsorship, CreateBounty } from "../model/inputs";

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

function usePrepareBuglessETHDeposit(opcode: number[], jsonContent:any , valueInWei:bigint){
    const encondeJson: Uint8Array = new TextEncoder().encode(
        JSON.stringify(jsonContent),
    );
    const inputPayload: Uint8Array = new Uint8Array(encondeJson.length + 4);
    inputPayload.set(opcode);
    inputPayload.set(encondeJson, 4);
   
    const {config} = usePrepareEtherPortalDepositEther({
    args:[dapp,toHex(inputPayload)],
    value : valueInWei,
    enabled:true,
   })

   return config;
}

export function usePrepareCreateBounty(bounty: CreateBounty) {
    return usePrepareBuglessInput([0x57, 0x92, 0x99, 0x3c], bounty);
}

export function usePrepareAddSponsorship(sponsorship:AddSponsorship,value:bigint){
    return usePrepareBuglessETHDeposit([0x43,0x03,0x2f,0xa8],sponsorship,value);
}

