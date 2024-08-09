"use client";
import { FC } from "react";
import { Button, Card, Text, Flex, Title } from "@mantine/core";
import Link from "next/link";
import { GH_README_URL } from "../utils/links";

const Home: FC = () => {
    return (
        <Flex direction={"row"} justify={"center"}>
            <Card
                mt={20}
                ml={20}
                mr={20}
                withBorder
                w={{ base: "300px", sm: "720px" }}
            >
                <Flex mt="md" mb="md" direction={"column"} align={"center"}>
                    <Title>A Trustless Bug Bounty Platform</Title>

                    <Text c="dimmed" mb="md">
                        Bug Buster accepts software written in any major
                        programming language. Through a friendly web interface,
                        hackers can test their exploits right on the browser,
                        without even having to sign Web3 transactions! Once the
                        hacker finds a valid exploit, they can finally send a
                        transaction requesting the reward to be transferred to
                        their account. All major wallets are supported!
                    </Text>
                </Flex>

                <Flex
                    direction={{ base: "column", sm: "row" }}
                    gap="md"
                    justify={"space-between"}
                >
                    <Link
                        href={GH_README_URL}
                        style={{ textDecoration: "none" }}
                    >
                        <Button fullWidth variant="outline" size="lg">
                            Learn more
                        </Button>
                    </Link>
                    <Link href={"/explore"} style={{ textDecoration: "none" }}>
                        <Button fullWidth size="lg">
                            Explore Bounties
                        </Button>
                    </Link>
                </Flex>
            </Card>
        </Flex>
    );
};

export default Home;
