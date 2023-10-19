"use client";
import { FC } from "react";
import {
    Button,
    Center,
    Stack,
    Title,
    List,
    Group,
    Image,
    Card,
    Flex,
    Text
} from "@mantine/core";
import Link from "next/link";
import { GetLatestState } from "../model/reader";
import { AppBounty } from "../model/state";

const Bounty: FC<{ index: number; bounty: AppBounty }> = ({
    index,
    bounty,
}) => {
    return (
        <Card href={"/bounty/" + index}>
            <Card.Section>
                <Image h={300} src={bounty.Developer.ImgLink} />
            </Card.Section>
            <Text fw={500} size="lg" mt="md">{bounty.Developer.Name}</Text>
            <Text size="sm" c="dimmend">{bounty.Description}</Text>
        </Card>
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
                <Stack>
                    {state.Bounties.map((bounty, index) => {
                        return <Bounty index={index} bounty={bounty} />;
                    })}
                </Stack>
            );
    }
};

const Home: FC = () => {
    function handleClick() {
        console.log("Submit a new Bounty!!!");
    }

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
