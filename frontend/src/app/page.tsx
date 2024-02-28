"use client";
import { FC, useEffect, useState } from "react";
import {
    Box,
    Button,
    Center,
    Stack,
    Image,
    Card,
    Flex,
    Text,
    Anchor,
    SimpleGrid,
    Group,
} from "@mantine/core";
import Link from "next/link";
import { GetLatestState } from "../model/reader";
import { AppBounty } from "../model/state";
import { BountyStatusBadge } from "../components/bountyStatus";
import { useBlockTimestamp } from "../hooks/block";
import { getBountyStatus } from "../utils/bounty";
import { useAccount } from "wagmi";

const Bounty: FC<{
    index: number;
    bounty: AppBounty;
    blockTimestamp: bigint;
}> = ({ index, bounty, blockTimestamp }) => {
    const bountyStatus = getBountyStatus(bounty, blockTimestamp);
    return (
        <Anchor href={"/bounty/" + index} underline="never">
            <Card>
                <Card.Section>
                    <Image
                        h={200}
                        p={6}
                        fit="contain"
                        alt="Bounty Image"
                        src={bounty.Developer.ImgLink}
                        fallbackSrc="/static/default_app.webp"
                    />
                </Card.Section>
                <Box w={400} mt="md">
                    <Group mb={10}>
                        <Text truncate="end" fw={700} size="lg">
                            {bounty.Developer.Name}
                        </Text>
                        <BountyStatusBadge
                            bountyStatus={bountyStatus}
                            bountyDeadline={bounty.Deadline}
                        />
                    </Group>
                    <Text truncate="end" size="xs" c="dimmend">
                        {bounty.Description}
                    </Text>
                </Box>
            </Card>
        </Anchor>
    );
};

const BountyList: FC = () => {
    const result = GetLatestState();
    const blockTimestamp = useBlockTimestamp();
    switch (result.kind) {
        case "loading":
            return <Center>Loading list of bounties...</Center>;
        case "error":
            return <Center>{result.message}</Center>;
        case "success":
            const state = result.response;
            return (
                <SimpleGrid m="sm" cols={{ base: 1, sm: 2, lg: 3 }}>
                    {state.Bounties?.map((bounty, index) => {
                        return (
                            <Bounty
                                key={index}
                                index={index}
                                bounty={bounty}
                                blockTimestamp={blockTimestamp!}
                            />
                        );
                    })}
                </SimpleGrid>
            );
    }
};

const Home: FC = () => {
    const [hasConnectedAccount, setHasConnectedAccount] = useState(false);
    const { address, connector, isConnected } = useAccount();

    useEffect(() => {
        setHasConnectedAccount(!!isConnected && !!address && !!connector);
    }, [isConnected, address, connector]);

    return (
        <Stack>
            {hasConnectedAccount && (
                <Flex mt={20} mr={20} justify="flex-end">
                    <Link href={"/bounty/create"}>
                        <Button size="lg">Create bounty</Button>
                    </Link>
                </Flex>
            )}
            <Center>
                <BountyList />
            </Center>
        </Stack>
    );
};

export default Home;
