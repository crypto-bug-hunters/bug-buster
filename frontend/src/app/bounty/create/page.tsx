"use client";
import { FC, useState, useRef } from "react";

import {
  Box,
  Button,
  Center,
  Group,
  Stack,
  TextInput,
  Textarea,
  useMantineTheme,
  FileButton,
  Text,
  FileInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

import {
  useInputBoxAddInput,
  usePrepareInputBoxAddInput,
} from "../../../hooks/contracts";
import { Address, toHex } from "viem";
import { useAccount, useWaitForTransaction } from "wagmi";

const CreateBounty: FC = () => {
  const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
  const theme = useMantineTheme();

  // App name
  const [name, setName] = useState("");

  // Description
  const [description, setDescription] = useState("");

  // ImgLink
  const [imgLink, setImgLink] = useState("");

  //Deadline
  const [deadline, setDeadline] = useState<Date | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const resetRef = useRef<() => void>(null);

  const clearFile = () => {
    setFile(null);
    resetRef.current?.();
  };

  const jsonContent = {
    Name: name,
    Description: description,
    ImgLink: imgLink,
    Deadline: deadline?.getTime(),
  };

  const inputPayload = toHex(JSON.stringify(jsonContent));

  const { config } = usePrepareInputBoxAddInput({
    args: [dapp, inputPayload],
    enabled: true,
  });

  const { data, isLoading, isSuccess, write } = useInputBoxAddInput(config);
  const wait = useWaitForTransaction(data);

  function submit() {
    if (write) write();
  }

  return (
    <Center
    // style={{
    //     backgroundImage: 'url("/img/banner.jpg")',
    //     backgroundRepeat: "no-repeat",
    //     backgroundPosition: "center",
    //     backgroundAttachment: "fixed",
    // }}
    >
      <Box p={20} mt={180} bg={theme.colors.dark[7]}>
        <Stack w={600}>
          <TextInput
            withAsterisk
            size="lg"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            description="Name of the App"
          />
          <Textarea
            withAsterisk
            size="lg"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            description="Description"
          />
          <TextInput
            withAsterisk
            size="lg"
            label="Image Link"
            value={imgLink}
            onChange={(e) => setImgLink(e.target.value)}
            description="App Image Link"
          />

          <DateInput
            withAsterisk
            label="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e)}
            description="Deadline"
          />

          <Group justify="Space-between" align="end" grow>
            <FileInput
              withAsterisk
              label="App File"
              description="The Application bundle in ZIP format"
              value={file}
              onChange={setFile}
              accept="application/zip"
            />
            <Button disabled={!file} color="red" onClick={clearFile}>
              Reset
            </Button>
          </Group>

          <Group justify="center" mt="md">
            <Button
              size="lg"
              type="submit"
              disabled={!write || !file}
              onClick={submit}
            >
              {"Create Bounty"}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Center>
  );
};

export default CreateBounty;
