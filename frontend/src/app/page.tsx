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
    Title,
    SimpleGrid,
} from "@mantine/core";
import Link from "next/link";
import { GetLatestState } from "../model/reader";
import { AppBounty } from "../model/state";

const Bounty: FC<{ index: number; bounty: AppBounty }> = ({
    index,
    bounty,
}) => {
    return (
        <Anchor href={"/bounty/" + index} underline="never">
            <Card>
                <Card.Section>
                    <Image h={100} src={bounty.Developer.ImgLink} />
                </Card.Section>
                <Box w={512}>
                    <Text truncate="end" fw={500} size="lg" mt="md">
                        {bounty.Developer.Name}
                    </Text>
                    <Text truncate="end" size="sm" c="dimmend">
                        {bounty.Description}
                    </Text>
                </Box>
            </Card>
        </Anchor>
    );
};

const BountyList: FC = () => {
    const result = GetLatestState();
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
                        return <Bounty index={index} bounty={bounty} />;
                    })}
                </SimpleGrid>
            );
    }
};

const Home: FC = () => {
    return (
        <Stack>
            <Flex mt={20} mr={20} justify="flex-end">
                <Link href={"/bounty/create"}>
                    <Button size="lg">Submit bounty</Button>
                </Link>
            </Flex>
            <Center>
                <BountyList />
            </Center>
        </Stack>
    );
};

export default Home;
