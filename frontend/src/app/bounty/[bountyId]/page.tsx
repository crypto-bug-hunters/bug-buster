"use client";
import { FC } from "react";

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

import { GetBounty } from "../../../model/reader";
import { Exploit, getBountyTotalPrize, AppBounty } from "../../../model/state";
import { usePrepareWithdrawSponsorship } from "../../../hooks/bugless";
import { useInputBoxAddInput } from "../../../hooks/contracts";

import { BountyParams, InvalidBountyId } from "./utils";
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
    const profile = bounty.developer;
    const totalPrize = getBountyTotalPrize(bounty);
    return (
        <Stack align="center">
            <Group>
                <Title order={2}>{profile.name}</Title>
                <BountyStatusBadgeGroup bountyStatus={bountyStatus} />
            </Group>
            <Image
                w={300}
                src={bounty.developer.imgLink}
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

const ExploitCodeBox: FC<{
    exploit: Exploit | undefined;
}> = ({ exploit }) => {
    if (!!exploit) {
        return (
            <Stack align="center">
                <Title order={2}>Exploit Code</Title>
                <Code block>{exploit.code}</Code>
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

const BountyInfoPage: FC<BountyParams> = ({ params: { bountyId } }) => {
    const bountyIndex = Number(bountyId);
    if (isNaN(bountyIndex)) {
        return <InvalidBountyId />;
    }
    const result = GetBounty(bountyIndex);
    switch (result.kind) {
        case "loading":
            return <Center>Loading bounty info...</Center>;
        case "error":
            return <Center>{result.message}</Center>;
        case "success":
            const bounty = result.response;
            return (
                <Center p={20} mt={20}>
                    <Stack w={800} gap={50} align="center" justify="center">
                        <BountyBox bountyId={bountyId} bounty={bounty} />
                        <ExploitCodeBox exploit={bounty.exploit} />
                        <ParticipantsBox bounty={bounty} />
                    </Stack>
                </Center>
            );
    }
};

export default BountyInfoPage;
