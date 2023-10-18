"use client";
import { FC, useState } from "react";

import {
  Box,
  Button,
  Center,
  Group,
  JsonInput,
  NumberInput,
  Stack,
  TextInput,
  useMantineTheme,
} from "@mantine/core";

const CreateBounty: FC = () => {
  const theme = useMantineTheme();

  // App name
  const [name, setName] = useState("");

  // Description
  const [description, setDescription] = useState("");

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
          <TextInput
            withAsterisk
            size="lg"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            description="Description"
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
            {/* <Button
                            size="lg"
                            type="submit"
                            disabled={!write}
                            onClick={write}
                        >
                            Create Bounty
                        </Button> */}
          </Group>
        </Stack>
      </Box>
    </Center>
  );
};

export default CreateBounty;
