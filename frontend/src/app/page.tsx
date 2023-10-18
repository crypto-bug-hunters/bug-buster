"use client";
import { FC } from "react";
import {
    Button,
    Center,
    Stack,
    Title,
    List,
} from "@mantine/core";

const Home: FC = () => {
  function handleClick() {
    console.log("Submit a new Bounty!!!");
  }

  return (
    <Stack>
      <Center>
          <Title>BugLess 🚫🪳</Title>
      </Center>
      <Button onClick={handleClick}>Submit new Bounty</Button>
    </Stack>
  );
};

export default Home;
