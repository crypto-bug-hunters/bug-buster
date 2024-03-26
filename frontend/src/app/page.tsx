"use client";
import { FC } from "react";
import {
    Button,
    Center,
    Stack,
    Image,
    Card,
    Text,
    Group,
} from "@mantine/core";
import Link from "next/link";

const Home: FC = () => {
    return (
        <Stack>
            <Center>
            <Card mt={20} ml={20} mr={20} withBorder>

                <Stack mt="md" mb="md" align="center">
                    <Text size="40px">A Trustless</Text>
                    <Text size="40px">Bug Bounty Platform</Text>
                </Stack>

                <Text c="dimmed" w={480} mb="md">
                Bugless accepts applications written in any major programming language.
                Through a friendly web interface, anyone can submit applications, and 
                sponsor them with Ether to incentivize hackers. All major wallets are supported!
                </Text>

                <Group justify="space-between">
                    <Link href={"/explore"}>
                        <Button size="lg">Explore Bounties</Button>
                    </Link>
                    <Link style={{ textDecoration: "none", color: "white"}} href={"https://github.com/crypto-bug-hunters/bugless/blob/main/README.md"}>
                        <Text size="lg">Learn More</Text>
                    </Link>
                </Group>
            </Card>
            </Center>
        </Stack>
    );
};

export default Home;
