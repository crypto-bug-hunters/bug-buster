"use client";
import {
    Box,
    Button,
    Center,
    Flex,
    Stack,
    Text,
    TextInput,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { FC, useEffect } from "react";
import { useWaitForTransaction, useAccount } from "wagmi";
import { parseUnits } from "viem";

import { BountyParams, ConcreteBountyParams } from "../utils.tsx";
import { usePrepareAddSponsorship } from "../../../../hooks/bug-buster";
import {
    erc20PortalAddress,
    useErc20PortalDepositErc20Tokens,
    usePrepareErc20Approve,
    useErc20Approve,
} from "../../../../hooks/contracts";
import { AddSponsorship } from "../../../../model/inputs";
import { useBounty } from "../../../../model/reader";
import { isPositiveNumber } from "../../../../utils/form";
import { transactionStatus } from "../../../../utils/transactionStatus";
import { useErc20Metadata, useErc20UserData } from "../../../../utils/erc20";

const AddSponsorshipForm: FC<ConcreteBountyParams> = ({
    bountyIndex,
    bounty,
}) => {
    const { token } = bounty;

    const { address: sponsorAddress } = useAccount();

    const { decimals, symbol } = useErc20Metadata(token);

    const { balance, allowance } = useErc20UserData(token, {
        user: sponsorAddress,
        spender: erc20PortalAddress,
        watch: true,
    });

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            name: "",
            imgLink: "",
            amount: "",
        },
        validate: {
            name: isNotEmpty("A sponsor name is required"),
            amount: isPositiveNumber("A valid amount is required"),
        },
        transformValues: (values) => ({
            name: values.name,
            imgLink: values.imgLink !== "" ? values.imgLink : undefined,
            amount:
                values.amount !== "" && decimals !== undefined
                    ? parseUnits(values.amount, decimals)
                    : undefined,
        }),
    });

    const { name, imgLink, amount } = form.getTransformedValues();

    // Approve

    const approvePrepare = usePrepareErc20Approve({
        address: token,
        args: [erc20PortalAddress, amount ?? 0n],
        enabled: amount !== undefined,
    });

    const approveWrite = useErc20Approve(approvePrepare.config);

    const approveWait = useWaitForTransaction({
        hash: approveWrite.data?.hash,
    });

    const { disabled: approveDisabled, loading: approveLoading } =
        transactionStatus(approvePrepare, approveWrite, approveWait);

    const needApproval =
        allowance !== undefined &&
        decimals !== undefined &&
        amount !== undefined &&
        allowance < amount;

    // Deposit

    const addSponsorship: AddSponsorship = {
        name,
        imgLink,
        bountyIndex,
    };

    const depositPrepare = usePrepareAddSponsorship(
        addSponsorship,
        token,
        amount ?? 0n,
    );

    const depositWrite = useErc20PortalDepositErc20Tokens(
        depositPrepare.config,
    );

    const depositWait = useWaitForTransaction({
        hash: depositWrite.data?.hash,
    });

    const { disabled: depositDisabled, loading: depositLoading } =
        transactionStatus(depositPrepare, depositWrite, depositWait);

    const canDeposit =
        allowance !== undefined &&
        balance !== undefined &&
        decimals !== undefined &&
        amount !== undefined &&
        amount > 0 &&
        amount <= allowance &&
        amount <= balance;

    const { refetch } = depositPrepare;

    // May need to refetch deposit configuration if allowance or balance change,
    // because they may influence the outcome of the function call.
    useEffect(() => {
        refetch();
    }, [balance, allowance, refetch]);

    return (
        <form>
            <Stack
                px={{ base: "xs", md: "lg" }}
                pt="xl"
                style={{
                    maxWidth: 800,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                <Title>Sponsor bounty</Title>
                <Text size="lg" fw={700} c="dimmed">
                    {bounty.name}
                </Text>
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Name"
                    placeholder="Satoshi Nakamoto"
                    {...form.getInputProps("name")}
                />
                <TextInput
                    size="lg"
                    label="Avatar URL"
                    placeholder="https://"
                    {...form.getInputProps("imgLink")}
                />
                <TextInput
                    disabled
                    size="lg"
                    label="Token address"
                    value={token}
                />
                <TextInput
                    withAsterisk
                    size="lg"
                    type="number"
                    min={0}
                    step={1}
                    label="Amount"
                    rightSection={symbol ? <Text>{symbol}</Text> : undefined}
                    rightSectionWidth={60}
                    placeholder="0"
                    {...form.getInputProps("amount")}
                />
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    gap="md"
                    justify={"space-between"}
                >
                    <Button
                        disabled={approveDisabled || !needApproval}
                        loading={approveLoading}
                        onClick={() =>
                            approveWrite.write && approveWrite.write()
                        }
                        size="lg"
                        fullWidth
                    >
                        Approve
                    </Button>
                    <Button
                        disabled={
                            depositDisabled || !canDeposit || !form.isValid()
                        }
                        loading={depositLoading}
                        onClick={() =>
                            depositWrite.write && depositWrite.write()
                        }
                        size="lg"
                        fullWidth
                    >
                        Deposit
                    </Button>
                </Flex>
            </Stack>
        </form>
    );
};

const AddSponsorshipPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const bountyIndex = Number(bountyId);
    const bountyResult = useBounty(bountyIndex);

    const theme = useMantineTheme();

    switch (bountyResult.kind) {
        case "loading":
            return <Center>Loading bounty info...</Center>;
        case "error":
            return <Center>{bountyResult.message}</Center>;
        case "success":
            return (
                <AddSponsorshipForm
                    bountyIndex={bountyIndex}
                    bounty={bountyResult.response}
                />
            );
    }
};

export default AddSponsorshipPage;
