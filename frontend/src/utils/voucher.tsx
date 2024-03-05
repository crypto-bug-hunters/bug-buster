import { ethers } from "ethers";
import { Voucher } from "../model/state";

const ETHER_TRANSFER_SELECTOR = "0x522f6815";

export function decodePayload(payload: string) {
    if (!payload) return null;

    let voucherDestination;
    let voucherAmount;

    const decoder = new ethers.utils.AbiCoder();
    const functionSelector = decoder.decode(["bytes4"], payload)[0];
    let payloadWithoutSelector = ethers.utils.hexDataSlice(payload, 4);
    try {
        if (functionSelector == ETHER_TRANSFER_SELECTOR) {
            //ether transfer;
            const transferParams = decoder.decode(
                ["address", "uint256"],
                payloadWithoutSelector,
            );
            voucherDestination = transferParams[0];
            voucherAmount = ethers.utils.formatEther(transferParams[1]);
        } else {
            throw new Error(
                "Unknown function selector. Only ether transfer is supported.",
            );
        }
    } catch (error) {
        throw new Error("Error decoding payload: " + error);
    }

    return { voucherDestination, voucherAmount };
}

export function getVouchersByUser(vouchers: Voucher[], account: string) {
    return vouchers.filter((voucher) => {
        const decodedPayload = decodePayload(voucher.payload);
        const voucherDestination = decodedPayload
            ? decodedPayload.voucherDestination
            : null;
        return (
            voucherDestination &&
            voucherDestination.toLowerCase() === account.toLowerCase()
        );
    });
}

export function getExecuteVoucherABI() {
    return [
        {
            inputs: [
                {
                    internalType: "address",
                    name: "_destination",
                    type: "address",
                },
                {
                    internalType: "bytes",
                    name: "_payload",
                    type: "bytes",
                },
                {
                    components: [
                        {
                            components: [
                                {
                                    internalType: "uint64",
                                    name: "inputIndexWithinEpoch",
                                    type: "uint64",
                                },
                                {
                                    internalType: "uint64",
                                    name: "outputIndexWithinInput",
                                    type: "uint64",
                                },
                                {
                                    internalType: "bytes32",
                                    name: "outputHashesRootHash",
                                    type: "bytes32",
                                },
                                {
                                    internalType: "bytes32",
                                    name: "vouchersEpochRootHash",
                                    type: "bytes32",
                                },
                                {
                                    internalType: "bytes32",
                                    name: "noticesEpochRootHash",
                                    type: "bytes32",
                                },
                                {
                                    internalType: "bytes32",
                                    name: "machineStateHash",
                                    type: "bytes32",
                                },
                                {
                                    internalType: "bytes32[]",
                                    name: "outputHashInOutputHashesSiblings",
                                    type: "bytes32[]",
                                },
                                {
                                    internalType: "bytes32[]",
                                    name: "outputHashesInEpochSiblings",
                                    type: "bytes32[]",
                                },
                            ],
                            internalType: "struct OutputValidityProof",
                            name: "validity",
                            type: "tuple",
                        },
                        {
                            internalType: "bytes",
                            name: "context",
                            type: "bytes",
                        },
                    ],
                    internalType: "struct Proof",
                    name: "_proof",
                    type: "tuple",
                },
            ],
            name: "executeVoucher",
            outputs: [
                {
                    internalType: "bool",
                    name: "",
                    type: "bool",
                },
            ],
            stateMutability: "nonpayable",
            type: "function",
        },
    ];
}

export function getWasVoucherExecutedABI() {
    return [
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_inputIndex",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_outputIndexWithinInput",
                    type: "uint256",
                },
            ],
            name: "wasVoucherExecuted",
            outputs: [
                {
                    internalType: "bool",
                    name: "",
                    type: "bool",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ];
}
