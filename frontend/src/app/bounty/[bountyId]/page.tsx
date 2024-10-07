"use client";
import { FC, useEffect, useState } from "react";

import {
    Button,
    Center,
    Code,
    Group,
    Flex,
    Stack,
    Image,
    Title,
    Text,
} from "@mantine/core";

import { useWaitForTransaction } from "wagmi";

import {
    parseHexAsJson,
    useBounty,
    useInput,
    isInput,
} from "../../../model/reader";
import { getBountyTotalPrize, AppBounty, BountyType } from "../../../model/state";
import { SendSolution } from "../../../model/inputs";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bug-buster";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, ConcreteBountyParams } from "./utils";
import { useBlockTimestamp } from "../../../hooks/block";
import { BountyStatus } from "../../../model/bountyStatus";
import { getBountyStatus } from "../../../utils/bounty";
import { useErc20Metadata, formatErc20Amount } from "../../../utils/erc20";
import { BountyStatusBadgeGroup } from "../../../components/bountyStatus";
import { ProfileCard } from "../../../components/profileCard";
import { LinkButton } from "../../../components/linkbtn";
import Link from "next/link";
import { HasConnectedAccount } from "../../../components/hasConnectedAccount";
import { transactionStatus } from "../../../utils/transactionStatus";

const WithdrawButton: FC<{
    bountyIndex: number;
    canWithdraw: boolean;
}> = ({ bountyIndex, canWithdraw }) => {
    const addInputPrepare = usePrepareWithdrawSponsorship({ bountyIndex });

    const addInputWrite = useInputBoxAddInput(addInputPrepare.config);

    const addInputWait = useWaitForTransaction({
        hash: addInputWrite.data?.hash,
    });

    const { disabled: addInputDisabled, loading: addInputLoading } =
        transactionStatus(addInputPrepare, addInputWrite, addInputWait);

    return (
        <Button
            disabled={
                addInputDisabled || !canWithdraw || addInputWait.isSuccess
            }
            loading={addInputLoading}
            onClick={() => addInputWrite.write && addInputWrite.write()}
            fullWidth
        >
            Withdraw
        </Button>
    );
};

const ButtonsBox: FC<{
    bountyIndex: number;
    bountyStatus: BountyStatus;
}> = ({ bountyIndex, bountyStatus }) => {
    const isOpen = bountyStatus.kind == "open";
    const canWithdraw =
        bountyStatus.kind === "expired" && !bountyStatus.withdrawn;
    return (
        <Flex
            direction={{ base: "column", sm: "row" }}
            gap="md"
            justify={"space-between"}
            w="100%"
        >
            <Button
                component={Link}
                href={`/bounty/${bountyIndex}/sponsor`}
                disabled={!isOpen}
                fullWidth
            >
                Sponsor
            </Button>
            <Button
                component={Link}
                href={`/bounty/${bountyIndex}/exploit`}
                disabled={!isOpen}
                fullWidth
                visibleFrom="md"
            >
                Submit exploit
            </Button>
            <WithdrawButton
                bountyIndex={bountyIndex}
                canWithdraw={canWithdraw}
            />
        </Flex>
    );
};

const BountyBox: FC<ConcreteBountyParams> = ({ bountyIndex, bounty }) => {
    const blockTimestamp = useBlockTimestamp();
    const bountyStatus = getBountyStatus(bounty, blockTimestamp);
    const totalPrize = getBountyTotalPrize(bounty);
    const { token } = bounty;
    const erc20Metadata = useErc20Metadata(token);
    return (
        <Stack align="center">
            <Group>
                <Title order={2}>{bounty.name}</Title>
                <BountyStatusBadgeGroup bountyStatus={bountyStatus} />
            </Group>
            <Image
                w="100%"
                style={{ maxWidth: 365 }}
                fit="cover"
                src={bounty.imgLink}
                alt="Bounty Image"
                fallbackSrc="/static/default_app.webp"
            />
            <Text styles={{ root: { whiteSpace: "pre-wrap" } }}>
                {bounty.description}
            </Text>
            {bounty.bountyType == BountyType.RLModel ? (
                <>
                    <Title order={3}>
                        RL Model Environment (for local development):
                    </Title>
                    <Code>
                        <pre>
                        {bounty.environment}
                        </pre>
                    </Code>
                </>
            ): ""}
            <Title order={3}>
                Total Prize:{" "}
                {formatErc20Amount(token, totalPrize, erc20Metadata)}
            </Title>
            <HasConnectedAccount>
                <ButtonsBox
                    bountyIndex={bountyIndex}
                    bountyStatus={bountyStatus}
                />
            </HasConnectedAccount>
        </Stack>
    );
};

const SolutionCodeBox: FC<{ bountyType: BountyType, solutionCode?: string }> = ({ bountyType, solutionCode }) => {
    if (solutionCode == undefined) return <></>
    switch(bountyType) {
        case BountyType.Bug:
            return (
                <Stack align="center">
                    <Title order={2}>Exploit Code</Title>
                    <Code w="100%" block>
                        {solutionCode}
                    </Code>
                </Stack>
            );
        case BountyType.RLModel:
            return (
                <Stack align="center">
                    <Title order={2}>Winning Model</Title>
                    <Link href={`data:application/octet-stream;${solutionCode}`}>
                        <Button>Download .ONNX model</Button>
                    </Link>
                </Stack>
            );
        default:
            return <></>;
    }
};

const ParticipantsBox: FC<{
    bounty: AppBounty;
}> = ({ bounty }) => {
    const { token } = bounty;
    const erc20Metadata = useErc20Metadata(token);

    const sponsorships = bounty.sponsorships?.map(
        ({ sponsor, value: amount }, index) => {
            return (
                <ProfileCard
                    key={index}
                    profile={sponsor}
                    badge="Sponsor"
                    badgeColor="purple"
                >
                    {formatErc20Amount(token, BigInt(amount), erc20Metadata)}
                </ProfileCard>
            );
        },
    );

    return (
        <Stack>
            <Center>
                <Title order={2}>Participants</Title>
            </Center>
            {bounty.exploit && (
                <ProfileCard
                    profile={bounty.exploit.hacker}
                    badge="Winner"
                />
            )}
            {sponsorships}
        </Stack>
    );
};

const isSendSolution = (payload: any): payload is SendSolution => {
    return payload !== undefined && ("solution" in payload || "exploit" in payload);
};

const BountyInfoPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const bountyIndex = Number(bountyId);

    const [solutionInputIndex, setSolutionInputIndex] = useState<number>();
    const [solutionCode, setSolutionCode] = useState<string>();

    // Gets bounty state from the Cartesi Machine
    const bountyResult = useBounty(bountyIndex);
    
    // Gets input for a given bounty attempt
    const inputResult = useInput(solutionInputIndex);

    useEffect(() => {
        if (bountyResult.kind == "success") {
            const bounty = bountyResult.response;
            const solution = bounty.exploit;
            if (solution !== null) {
                console.log(solution)
                setSolutionInputIndex(solution.inputIndex);
            }
        }
    }, [bountyResult]);

    useEffect(() => {
        if (inputResult.kind == "success") {
            const input = parseHexAsJson(inputResult.response.payload);
            if (isInput(input)) {
                const payload = input.payload;
                if (isSendSolution(payload)) {
                    setSolutionCode(atob(payload.exploit));
                }
            }
        }
    }, [inputResult]);

    switch (bountyResult.kind) {
        case "loading":
            return <Center>Loading bounty info...</Center>;
        case "error":
            return <Center>{bountyResult.message}</Center>;
    }

    if (solutionInputIndex !== undefined) {
        switch (inputResult.kind) {
            case "loading":
                return <Center>Loading exploit input...</Center>;
            case "error":
                return <Center>{inputResult.message}</Center>;
        }
    }

    const bounty = bountyResult.response;

    return (
        <Stack
            style={{ maxWidth: 768, marginLeft: "auto", marginRight: "auto" }}
            p={{ base: "xs", md: "lg" }}
            gap="xl"
        >
            <BountyBox bountyIndex={bountyIndex} bounty={bounty} />
            <SolutionCodeBox bountyType={bounty.bountyType} solutionCode={solutionCode} />
            <ParticipantsBox bounty={bounty} />
        </Stack>
    );
};

export default BountyInfoPage;
