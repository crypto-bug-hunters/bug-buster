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

const Bounty: FC<{ bounty: AppBounty }> = ({ bounty }) => {
  return (
    <Group>
      <Title order={2}>{bounty.Developer.Name}</Title>
      <Image src={bounty.Developer.ImgLink} />
    </Group>
  );
};

const BountyList: FC = () => {
  const result = GetLatestState();
  switch (result.state) {
    case "loading":
      return <Center>Loading list of bounties...</Center>;
    case "error":
      return <Center>{result.message}</Center>;
    case "success":
      return (
        <Stack>
          {result.response.Bounties.map((bounty) => {
            return <Bounty bounty={bounty} />;
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
