"use client";
import { FC } from "react";
import { Button, Center, Stack, Title, List } from "@mantine/core";
import Link from "next/link";
import { GetLatestState } from "../model/reader";

const Home: FC = () => {
  function handleClick() {
    console.log("Submit a new Bounty!!!");
  }

  return (
    <Stack>
      <Center>
        <div><pre>{JSON.stringify(GetLatestState(), null, "\t")}</pre></div>
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
