"use client";
import { FC } from "react";
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
import { useLatestState } from "../../model/reader";
import { AppBounty } from "../../model/state";
import { BountyStatusBadgeGroup } from "../../components/bountyStatus";
import { HasConnectedAccount } from "../../components/hasConnectedAccount";
import { useBlockTimestamp } from "../../hooks/block";
import { getBountyStatus } from "../../utils/bounty";
import { GOOGLE_BOUNTY_CREATION_FORM_URL } from "../../utils/links";

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
                        src={bounty.imgLink}
                        fallbackSrc="/static/default_app.webp"
                    />
                </Card.Section>
                <Box w={400} mt="md">
                    <Group mb={10}>
                        <Text truncate="end" fw={700} size="lg">
                            {bounty.name}
                        </Text>
                        <BountyStatusBadgeGroup bountyStatus={bountyStatus} />
                    </Group>
                    <Text truncate="end" size="xs" c="dimmend">
                        {bounty.description}
                    </Text>
                </Box>
            </Card>
        </Anchor>
    );
};

const BountyList: FC = () => {
    const stateResult = useLatestState();
    const blockTimestamp = useBlockTimestamp();

    switch (stateResult.kind) {
        case "loading":
            return <Center>Loading list of bounties...</Center>;
        case "error":
            return <Center>{stateResult.message}</Center>;
    }

    const state = stateResult.response;

    return (
        <SimpleGrid m="sm" cols={{ base: 1, sm: 2, lg: 3 }}>
            {state.bounties.map((bounty, index) => {
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
};

const Explore: FC = () => {
    return (
        <Stack>
            <HasConnectedAccount>
                <Flex mt={20} mr={20} justify="flex-end">
                    <Link href={GOOGLE_BOUNTY_CREATION_FORM_URL}>
                        <Button size="lg">Create bounty</Button>
                    </Link>
                </Flex>
            </HasConnectedAccount>
            <Center>
                <BountyList />
            </Center>
        </Stack>
    );
};

export default Explore;
