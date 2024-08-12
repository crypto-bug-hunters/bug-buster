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
import { Address, isAddressEqual } from "viem";
import {
    useAccount,
    useContractRead,
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from "wagmi";

import { useVouchers } from "../../model/reader";
import { Voucher } from "../../utils/voucher";
import { decodeVoucher } from "../../utils/voucher";
import { getDAppAddress } from "../../utils/address";
import { voucherExecutionAbi, dummyProof } from "../../utils/voucher";
import { useErc20Metadata, formatErc20Amount } from "../../utils/erc20";
import { transactionStatus } from "../../utils/transactionStatus";

const WithdrawButton: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const { data: wasExecuted, error: wasExecutedError } = useContractRead({
        address: getDAppAddress(),
        abi: voucherExecutionAbi,
        functionName: "wasVoucherExecuted",
        args: [BigInt(voucher.input.index), BigInt(voucher.index)],
        watch: true,
    });

    const proof = voucher.proof ?? dummyProof;
    const { validity } = proof;
    const { inputIndexWithinEpoch, outputIndexWithinInput } = validity;

    const executePrepare = usePrepareContractWrite({
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

    const executeWrite = useContractWrite(executePrepare.config);

    const executeWait = useWaitForTransaction({
        hash: executeWrite.data?.hash,
    });

    const { disabled: executeDisabled, loading: executeLoading } =
        transactionStatus(executePrepare, executeWrite, executeWait);

    if (wasExecutedError !== null) {
        return <Badge color="red">Error</Badge>;
    }

    if (wasExecuted === undefined) {
        return <Badge color="orange">Loading</Badge>;
    }

    if (wasExecuted) {
        return <Badge color="grey">Executed</Badge>;
    }

    if (voucher.proof === null) {
        return <Badge color="orange">Missing proof</Badge>;
    }

    return (
        <Button
            disabled={executeDisabled}
            loading={executeLoading}
            onClick={() => executeWrite.write && executeWrite.write()}
            size="xs"
            mb={10}
        >
            Execute
        </Button>
    );
};

const VoucherCard: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const { token, value } = decodeVoucher(voucher);
    const erc20Metadata = useErc20Metadata(token);

    return (
        <Center>
            <Card w="400px" shadow="sm" radius="md" withBorder>
                <Flex justify="space-between">
                    <Text size="lg">
                        {formatErc20Amount(token, value, erc20Metadata)}
                    </Text>
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
    const voucherCards = vouchers
        .map((voucher) => {
            const key = `voucher_${voucher.input.index}_${voucher.index}`;
            const voucherCard = <VoucherCard key={key} voucher={voucher} />;
            return { voucher, voucherCard };
        })
        .filter(({ voucher }) => {
            const { receiver } = decodeVoucher(voucher);
            return isAddressEqual(receiver, account);
        })
        .map(({ voucherCard }) => voucherCard);

    if (voucherCards.length == 0) {
        return (
            <Center mt="xl">
                <Text size="xl">No vouchers available for {account}!</Text>
            </Center>
        );
    }

    return (
        <Stack p={{ base: "xs", md: "lg" }}>
            <Center mt="xl">
                <Text size="xl">Available vouchers:</Text>
            </Center>
            {voucherCards}
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
