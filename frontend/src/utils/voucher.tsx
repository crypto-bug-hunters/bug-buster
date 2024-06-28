import {
    parseAbi,
    decodeFunctionData,
    Address,
    isAddressEqual,
    Hash,
    Hex,
} from "viem";

export interface Validity {
    inputIndexWithinEpoch: number;
    outputIndexWithinInput: number;
    outputHashesRootHash: Hash;
    vouchersEpochRootHash: Hash;
    noticesEpochRootHash: Hash;
    machineStateHash: Hash;
    outputHashInOutputHashesSiblings: Hash[];
    outputHashesInEpochSiblings: Hash[];
}

export interface Proof {
    context: Hex;
    validity: Validity;
}

const ZERO_HASH: Hash =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

export const dummyProof: Proof = {
    context: "0x",
    validity: {
        inputIndexWithinEpoch: 0,
        outputIndexWithinInput: 0,
        outputHashesRootHash: ZERO_HASH,
        vouchersEpochRootHash: ZERO_HASH,
        noticesEpochRootHash: ZERO_HASH,
        machineStateHash: ZERO_HASH,
        outputHashInOutputHashesSiblings: [],
        outputHashesInEpochSiblings: [],
    },
};

export interface Voucher {
    index: number;
    input: { index: number };
    destination: Address;
    payload: Hex;
    proof?: Proof;
}

const erc20TransferAbi = parseAbi([
    "function transfer(address to, uint256 value) public returns (bool success)",
]);

export const voucherExecutionAbi = parseAbi([
    "struct OutputValidityProof { uint64 inputIndexWithinEpoch; uint64 outputIndexWithinInput; bytes32 outputHashesRootHash; bytes32 vouchersEpochRootHash; bytes32 noticesEpochRootHash; bytes32 machineStateHash; bytes32[] outputHashInOutputHashesSiblings; bytes32[] outputHashesInEpochSiblings; }",
    "struct Proof { OutputValidityProof validity; bytes context; }",
    "function wasVoucherExecuted(uint256 inputIndex, uint256 outputIndexWithinInput) external view returns (bool)",
    "function executeVoucher(address _destination, bytes calldata _payload, Proof calldata _proof) external returns (bool)",
]);

export function decodeVoucher(voucher: Voucher) {
    const { destination, payload } = voucher;

    const { args } = decodeFunctionData({
        abi: erc20TransferAbi,
        data: payload,
    });

    const [receiver, value] = args;

    return {
        token: destination,
        receiver,
        value,
    };
}

export function filterVouchersByReceiver(
    vouchers: Voucher[],
    account: Address,
) {
    return vouchers.filter((voucher) => {
        const { receiver } = decodeVoucher(voucher);
        return isAddressEqual(receiver, account);
    });
}
