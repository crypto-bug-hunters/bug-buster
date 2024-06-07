"use client";
import { FC } from "react";
import { Button, Stack, Card, Text, Group } from "@mantine/core";
import Link from "next/link";
import { GH_README_URL } from "../utils/links";

const Home: FC = () => {
    return (
        <Stack align="center">
            <Card mt={20} ml={20} mr={20} withBorder>
                <Stack mt="md" mb="md" align="center">
                    <Text size="40px">A Trustless</Text>
                    <Text size="40px">Bug Bounty Platform</Text>
                </Stack>

                <Text c="dimmed" w={720} mb="md">
                    Bug Buster accepts software written in any major programming
                    language. Through a friendly web interface, hackers can test
                    their exploits right on the browser, without even having to
                    sign Web3 transactions! Once the hacker finds a valid
                    exploit, they can finally send a transaction requesting the
                    reward to be transferred to their account. All major wallets
                    are supported!
                </Text>

                <Group justify="space-between">
                    <Link href={"/explore"}>
                        <Button size="lg">Explore Bounties</Button>
                    </Link>
                    <Link href={GH_README_URL}>
                        <Button variant="outline" size="lg">
                            Learn more
                        </Button>
                    </Link>
                </Group>
            </Card>
        </Stack>
    );
};

export default Home;
