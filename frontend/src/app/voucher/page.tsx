"use client";
import { FC } from "react";
import {
    Badge,
    Button,
    Card,
    Center,
    Divider,
    Flex,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { useVouchers } from "../../model/reader";
import { Voucher } from "../../utils/voucher";
import { decodeVoucher, filterVouchersByReceiver } from "../../utils/voucher";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { getDAppAddress } from "../../utils/address";
import { voucherExecutionAbi, dummyProof } from "../../utils/voucher";
import { Address, formatEther } from "viem";

const WithdrawButton: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const { data: wasExecuted, error: wasExecutedError } = useContractRead({
        address: getDAppAddress(),
        abi: voucherExecutionAbi,
        functionName: "wasVoucherExecuted",
        args: [BigInt(voucher.input.index), BigInt(voucher.index)],
    });

    const proof = voucher.proof ?? dummyProof;
    const { validity } = proof;
    const { inputIndexWithinEpoch, outputIndexWithinInput } = validity;

    const { write: executeVoucher } = useContractWrite({
        address: getDAppAddress(),
        abi: voucherExecutionAbi,
        functionName: "executeVoucher",
        args: [
            voucher.destination,
            voucher.payload,
            {
                ...proof,
                validity: {
                    ...validity,
                    inputIndexWithinEpoch: BigInt(inputIndexWithinEpoch),
                    outputIndexWithinInput: BigInt(outputIndexWithinInput),
                },
            },
        ],
    });

    if (wasExecutedError !== null) {
        return <Badge color="red">{wasExecutedError.message}</Badge>;
    }

    if (wasExecuted === undefined) {
        return <Badge color="orange">Checking execution status...</Badge>;
    }

    if (wasExecuted) {
        return <Badge color="green">Executed!</Badge>;
    }

    if (voucher.proof === null) {
        return <Badge color="orange">Waiting for proof...</Badge>;
    }

    if (executeVoucher === undefined) {
        return <Badge color="orange">Preparing transaction...</Badge>;
    }

    return <Button onClick={() => executeVoucher()}>Execute</Button>;
};

const VoucherInfo: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const { value } = decodeVoucher(voucher);

    return (
        <Center>
            <Card w="400px" shadow="sm" radius="md" withBorder>
                <Flex justify="space-between">
                    <Text size="lg">{formatEther(value)} ETH</Text>
                    <WithdrawButton voucher={voucher} />
                </Flex>
                <Divider />
                <Group pt="20px">
                    <Text size="xs">
                        Input {voucher.input.index} / Voucher {voucher.index}
                    </Text>
                </Group>
            </Card>
        </Center>
    );
};

const VoucherList: FC<{ vouchers: Voucher[]; account: Address }> = ({
    vouchers,
    account,
}) => {
    const vouchersForAccount = filterVouchersByReceiver(vouchers, account);

    if (vouchersForAccount.length == 0) {
        return (
            <Center mt="xl">
                <Text size="xl">No vouchers available for {account}!</Text>
            </Center>
        );
    }

    return (
        <Stack>
            <Center mt="xl">
                <Text size="xl">Available vouchers:</Text>
            </Center>
            {vouchersForAccount.map((voucher) => {
                const key = `voucher_${voucher.input.index}_${voucher.index}`;
                return <VoucherInfo key={key} voucher={voucher} />;
            })}
        </Stack>
    );
};

const ErrorMessage: FC<{ message: string }> = ({ message }) => {
    return <Center h="200px">{message}</Center>;
};

const VoucherHome: FC = () => {
    const { address: account } = useAccount();
    const vouchersResult = useVouchers();

    switch (vouchersResult.kind) {
        case "loading":
            return <ErrorMessage message={"Loading vouchers..."} />;
        case "error":
            return <ErrorMessage message={vouchersResult.message} />;
    }

    const vouchers = vouchersResult.response;

    if (vouchers.length == 0) {
        return <ErrorMessage message={"No vouchers available!"} />;
    }

    return <VoucherList vouchers={vouchers} account={account ?? "0x"} />;
};

export default VoucherHome;
