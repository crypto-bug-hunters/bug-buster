"use client";
import { FC } from "react";
import { Button, Center, Stack, Title, List } from "@mantine/core";
import Link from "next/link";

const Home: FC = () => {
  function handleClick() {
    console.log("Submit a new Bounty!!!");
  }

  return (
    <Stack>
      <Center>
        <Link href={"/bounty/create"}>
          <Button>Submit new Bounty</Button>
        </Link>
      </Center>
    </Stack>
  );
};

export default Home;
