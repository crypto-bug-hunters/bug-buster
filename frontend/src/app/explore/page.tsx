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
    Checkbox,
    Popover,
    TextInput,
    Button,
    Flex,
} from "@mantine/core";
import { IoFilter } from "react-icons/io5";
import Link from "next/link";
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
import FilterPopover from "../../components/bountyFilter";
import { HasConnectedAccount } from "../../components/hasConnectedAccount";

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

const BountyList: FC = () => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const stateResult = useLatestState();
    const blockTimestamp = useBlockTimestamp();

    switch (stateResult.kind) {
        case "loading":
            return <Center>Loading list of bounties...</Center>;
        case "error":
            return <Center>{stateResult.message}</Center>;
    }

    const state = stateResult.response;

    // TODO: Implement multiple filter selection
    const filteredBounties = selectedFilters.length
        ? state.bounties.filter(
              (bounty) =>
                  getBountyStatus(bounty, blockTimestamp).kind ===
                  selectedFilters[0].toLowerCase(),
          )
        : state.bounties;

    return (
        <Stack>
            <FilterPopover
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
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
        </Stack>
    );
};

const Explore: FC = () => {
    return (
        <Stack>
            <HasConnectedAccount>
                <Flex
                    mt="lg"
                    mr={{ base: "xs", md: "lg" }}
                    ml={{ base: "xs", md: "lg" }}
                    justify={"space-between"}
                    visibleFrom="md"
                >
                    <Link href="/bounty/create">
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
