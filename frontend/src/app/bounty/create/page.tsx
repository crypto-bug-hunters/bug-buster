"use client";
import { FC, useState } from "react";

import {
  Box,
  Button,
  Center,
  Group,
  Stack,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import {
    DateInput
} from "@mantine/dates";

import {
    useInputBoxAddInput, usePrepareInputBoxAddInput
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
  const [deadline,setDeadline] = useState<Date | null>(null);

   // connected account
   const { address } = useAccount();

   const jsonContent = {
    Name : name,
    Description: description,
    ImgLink : imgLink,
    Deadline: deadline?.getTime(),
};

   const inputPayload =  toHex(JSON.stringify(jsonContent));

   const {config} = usePrepareInputBoxAddInput({
    args:[
        dapp,
        inputPayload
    ],
    enabled:true});

  const { data, write } = useInputBoxAddInput(config);
  const wait = useWaitForTransaction(data);

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
          <Group justify="center" mt="md">
            {/* <ApproveButton
                            allowance={allowance}
                            buttonProps={{ size: "lg" }}
                            depositAmount={
                                isNaN(initialPool)
                                    ? 0n
                                    : BigInt(initialPool) * 10n ** 18n
                            }
                            token={token}
                        /> */}
            <Button
                            size="lg"
                            type="submit"
                            disabled={!write}
                            onClick={write}
                        >
                            Create Bounty
                        </Button>
          </Group>
        </Stack>
      </Box>
    </Center>
  );
};

export default CreateBounty;
