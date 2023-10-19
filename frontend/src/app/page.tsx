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
} from "@mantine/core";
import Link from "next/link";
import { GetLatestState } from "../model/reader";
import { AppBounty } from "../model/state";

const Bounty: FC<{ index: number, bounty: AppBounty }> = ({ index, bounty }) => {
    return (
        <Stack>
            <Link href={"/bounty/" + index}>
                <Image h={300} src={bounty.Developer.ImgLink} />
                <Title order={2}>{bounty.Developer.Name}</Title>
            </Link>
        </Stack>
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
            <Center>
                <BountyList />
            </Center>
            <Center>
                <Link href={"/bounty/create"}>
                    <Button>Submit bounty</Button>
                </Link>
            </Center>
        </Stack>
    );
};

export default Home;
