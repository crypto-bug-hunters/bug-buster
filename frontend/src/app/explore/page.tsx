"use client";
import { FC, useState } from "react";
import {
    Box,
    Center,
    Stack,
    Image,
    Card,
    Text,
    Anchor,
    SimpleGrid,
    Tooltip,
    Flex,
} from "@mantine/core";
import { useLatestState } from "../../model/reader";
import { AppBounty } from "../../model/state";
import { BountyStatusBadgeGroup } from "../../components/bountyStatus";
import { useBlockTimestamp } from "../../hooks/block";
import {
    getBountyStatus,
    getBountyTotalPrize,
    getBountyDescription,
} from "../../utils/bounty";
import { useErc20Metadata, formatErc20Amount } from "../../utils/erc20";
import BountyFilter from "../../components/bountyFilter";

const Bounty: FC<{
    index: number;
    bounty: AppBounty;
    blockTimestamp: bigint;
}> = ({ index, bounty, blockTimestamp }) => {
    const bountyStatus = getBountyStatus(bounty, blockTimestamp);
    const totalPrize = getBountyTotalPrize(bounty);
    const { token } = bounty;
    const erc20Metadata = useErc20Metadata(token);
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
                    <Tooltip
                        label={getBountyDescription(bounty.description, 200)}
                        multiline={true}
                        w={220}
                    >
                        <Stack>
                            <Text truncate="end" fw={700} size="lg" mt="sm">
                                {bounty.name}
                            </Text>
                            <BountyStatusBadgeGroup
                                bountyStatus={bountyStatus}
                            />
                            <Text>
                                Total Prize:{" "}
                                {formatErc20Amount(
                                    token,
                                    totalPrize,
                                    erc20Metadata,
                                )}
                            </Text>
                        </Stack>
                    </Tooltip>
                </Box>
            </Card>
        </Anchor>
    );
};

const Explore: FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<string>("open");
    const stateResult = useLatestState();
    const blockTimestamp = useBlockTimestamp();

    switch (stateResult.kind) {
        case "loading":
            return <Center>Loading list of bounties...</Center>;
        case "error":
            return <Center>{stateResult.message}</Center>;
    }

    const state = stateResult.response;

    const filteredBounties = !selectedFilter.length
        ? state.bounties
        : state.bounties.filter(
              (bounty) =>
                  getBountyStatus(bounty, blockTimestamp).kind ===
                  selectedFilter.toLowerCase(),
          );

    return (
        <Flex direction="column" align={"center"}>
            <BountyFilter
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />
            <SimpleGrid
                m={{ base: "xs", md: "lg" }}
                cols={{ base: 1, sm: 2, lg: 3 }}
                spacing="xl"
                verticalSpacing="lg"
                style={{ maxWidth: 1024 }}
            >
                {filteredBounties.map((bounty, index) => {
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
        </Flex>
    );
};

export default Explore;
