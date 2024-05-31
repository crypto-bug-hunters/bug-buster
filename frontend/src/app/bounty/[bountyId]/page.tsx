"use client";
import { FC, useEffect, useState } from "react";

import {
    Button,
    Center,
    Code,
    Group,
    Stack,
    Image,
    Title,
    Text,
} from "@mantine/core";

import { formatEther } from "viem";

import {
    parseHexAsJson,
    useBounty,
    useInput,
    isInput,
} from "../../../model/reader";
import { getBountyTotalPrize, AppBounty } from "../../../model/state";
import { SendExploit } from "../../../model/inputs";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bug-buster";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams } from "./utils";
import { useBlockTimestamp } from "../../../hooks/block";
import { BountyStatus } from "../../../model/bountyStatus";
import { getBountyStatus } from "../../../utils/bounty";
import { BountyStatusBadgeGroup } from "../../../components/bountyStatus";
import { useWaitForTransaction } from "wagmi";
import { ProfileCard } from "../../../components/profileCard";
import { LinkButton } from "../../../components/linkbtn";
import { HasConnectedAccount } from "../../../components/hasConnectedAccount";

const WithdrawButton: FC<{
    bountyId: string;
    disabled: boolean;
}> = ({ bountyId, disabled }) => {
    const bountyIndex = Number(bountyId);
    const config = usePrepareWithdrawSponsorship({ bountyIndex });
    const { data, write } = useInputBoxAddInput(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });
    return (
        <Group>
            <Button disabled={disabled || !write || isLoading} onClick={write}>
                {isLoading ? "Withdrawing..." : "Withdraw"}
            </Button>
            <Group justify="center">
                {isSuccess && (
                    <>
                        <Text size="lg">Withdraw transaction successful!</Text>
                    </>
                )}
            </Group>
        </Group>
    );
};

const ButtonsBox: FC<{
    bountyId: string;
    bountyStatus: BountyStatus;
}> = ({ bountyId, bountyStatus }) => {
    const isOpen = bountyStatus.kind == "open";
    const enableWithdrawals =
        bountyStatus.kind == "expired" && !bountyStatus.withdrawn;
    return (
        <Group justify="left">
            <LinkButton href={`/bounty/${bountyId}/sponsor`} disabled={!isOpen}>
                Sponsor
            </LinkButton>
            <LinkButton href={`/bounty/${bountyId}/exploit`} disabled={!isOpen}>
                Submit exploit
            </LinkButton>
            <WithdrawButton bountyId={bountyId} disabled={!enableWithdrawals} />
        </Group>
    );
};

const BountyBox: FC<{
    bountyId: string;
    bounty: AppBounty;
}> = ({ bountyId, bounty }) => {
    const blockTimestamp = useBlockTimestamp();
    const bountyStatus = getBountyStatus(bounty, blockTimestamp);
    const totalPrize = getBountyTotalPrize(bounty);
    return (
        <Stack align="center">
            <Group>
                <Title order={2}>{bounty.name}</Title>
                <BountyStatusBadgeGroup bountyStatus={bountyStatus} />
            </Group>
            <Image
                w={300}
                src={bounty.imgLink}
                alt="Bounty Image"
                fallbackSrc="/static/default_app.webp"
            />
            <Text styles={{ root: { whiteSpace: "pre-wrap" } }}>
                {bounty.description}
            </Text>
            <Title order={3}>Total Prize: {formatEther(totalPrize)} ETH</Title>
            <HasConnectedAccount>
                <ButtonsBox bountyId={bountyId} bountyStatus={bountyStatus} />
            </HasConnectedAccount>
        </Stack>
    );
};

const ExploitCodeBox: FC<{ exploitCode?: string }> = ({ exploitCode }) => {
    if (exploitCode !== undefined) {
        return (
            <Stack align="center">
                <Title order={2}>Exploit Code</Title>
                <Code block>{exploitCode}</Code>
            </Stack>
        );
    }
    return <></>;
};

const ParticipantsBox: FC<{
    bounty: AppBounty;
}> = ({ bounty }) => {
    return (
        <Stack align="center">
            <Title order={2}>Participants</Title>
            {bounty.exploit && (
                <ProfileCard
                    profile={bounty.exploit.hacker}
                    badge="Exploiter"
                />
            )}
            {bounty.sponsorships &&
                bounty.sponsorships.map((sponsorship, index) => {
                    return (
                        <ProfileCard
                            key={index}
                            profile={sponsorship.sponsor}
                            badge="Sponsor"
                            badgeColor="purple"
                        >
                            {formatEther(BigInt(sponsorship.value))} ETH
                        </ProfileCard>
                    );
                })}
        </Stack>
    );
};

const isSendExploit = (payload: any): payload is SendExploit => {
    return payload !== undefined && "exploit" in payload;
};

const BountyInfoPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const bountyIndex = Number(bountyId);

    const [exploitInputIndex, setExploitInputIndex] = useState<number>();
    const [exploitCode, setExploitCode] = useState<string>();

    const bountyResult = useBounty(bountyIndex);
    const inputResult = useInput(exploitInputIndex);

    useEffect(() => {
        if (bountyResult.kind == "success") {
            const bounty = bountyResult.response;
            const exploit = bounty.exploit;
            if (exploit !== null) {
                setExploitInputIndex(exploit.inputIndex);
            }
        }
    }, [bountyResult]);

    useEffect(() => {
        if (inputResult.kind == "success") {
            const input = parseHexAsJson(inputResult.response.payload);
            if (isInput(input)) {
                const payload = input.payload;
                if (isSendExploit(payload)) {
                    setExploitCode(atob(payload.exploit));
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

    if (exploitInputIndex !== undefined) {
        switch (inputResult.kind) {
            case "loading":
                return <Center>Loading exploit input...</Center>;
            case "error":
                return <Center>{inputResult.message}</Center>;
        }
    }

    const bounty = bountyResult.response;

    return (
        <Center p={20} mt={20}>
            <Stack w={800} gap={50} align="center" justify="center">
                <BountyBox bountyId={bountyId} bounty={bounty} />
                <ExploitCodeBox exploitCode={exploitCode} />
                <ParticipantsBox bounty={bounty} />
            </Stack>
        </Center>
    );
};

export default BountyInfoPage;
