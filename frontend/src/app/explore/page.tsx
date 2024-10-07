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
    Radio,
} from "@mantine/core";
import Link from "next/link";
import { useLatestState } from "../../model/reader";
import { AppBounty, BountyType } from "../../model/state";
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
            <Card h="100%">
                <Card.Section style={{ overflow: "hidden" }} bg="dark" p="sm">
                    <Image
                        style={{ maxWidth: "100%" }}
                        h="300"
                        fit="contain"
                        alt="Bounty Image"
                        src={bounty.imgLink}
                        fallbackSrc="/static/default_app.webp"
                    />
                </Card.Section>
                <Box>
                    <Group my="sm">
                        <Text truncate="end" fw={700} size="lg">
                            {bounty.name}
                        </Text>
                        <BountyStatusBadgeGroup bountyStatus={bountyStatus} />
                        <BountyStatusBadgeGroup bountyStatus={{ kind: (bounty.bountyType == 0 ? "bug" : "model") }} />
                    </Group>
                    <Text truncate="end" size="xs" c="dimmend">
                        {bounty.description}
                    </Text>
                </Box>
            </Card>
        </Anchor>
    );
};

const BountyList: FC<{
    bountyKindFilter: BountyType | null
}> = ({ bountyKindFilter }) => {
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
        <SimpleGrid
            m={{ base: "xs", md: "lg" }}
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="xl"
            verticalSpacing="lg"
            style={{ maxWidth: 1024 }}
        >
            {state.bounties.filter((bounty => bounty.bountyType == bountyKindFilter || bountyKindFilter == null)).map((bounty) => {
                return (
                    <Bounty
                        key={bounty.bountyIndex}
                        index={bounty.bountyIndex}
                        bounty={bounty}
                        blockTimestamp={blockTimestamp!}
                    />
                );
            })}
        </SimpleGrid>
    );
};

const Explore: FC = () => {
    const [bountyKindFilterStr, setBountyKindFilterStr] = useState<string>("all");

    return (
        <Stack>
            <HasConnectedAccount>
                <Flex
                    mt="lg"
                    mr={{ base: "xs", md: "lg" }}
                    justify="end"
                    visibleFrom="md"
                >

                    <Link href={GOOGLE_BOUNTY_CREATION_FORM_URL}>
                        <Button size="lg">Create bounty</Button>
                    </Link>
                </Flex>
            </HasConnectedAccount>
            <Center>
                <Radio.Group
                    name="filterBountyKind"
                    label="Filter bounties by kind"
                    withAsterisk
                    value={bountyKindFilterStr}
                    onChange={setBountyKindFilterStr}

                >
                    <Group mt="xs">
                        <Radio value="all" label="All bounties" />
                        <Radio value="bug" label="Bug bounties" />
                        <Radio value="rl" label="RL bounties" />
                    </Group>
                </Radio.Group>
            </Center>
            <Center>
                <BountyList bountyKindFilter={bountyKindFilterStr == "rl" ? BountyType.RLModel : bountyKindFilterStr == "bug" ? BountyType.Bug : null} />
            </Center>
        </Stack>
    );
};

export default Explore;
