import { Group, ActionIcon, Center, Box, Text } from "@mantine/core";
import { IconBrandX, IconBrandTelegram } from "@tabler/icons-react";
import { FC } from "react";

export const Footer: FC = () => {
    return (
        <Group bg="gray" p="0.3rem">
            <Center w="100%" py="0.3rem">
                <Group gap="sm">
                    <Text>Bug Buster</Text>
                    <ActionIcon
                        component="a"
                        href="https://x.com/BugBusterApp"
                        size="xl"
                        variant="transparent"
                    >
                        <IconBrandX color="white" />
                    </ActionIcon>

                    <ActionIcon
                        component="a"
                        href="https://t.me/+G_CPMEhCHC04MzA5"
                        size="xl"
                        variant="transparent"
                    >
                        <IconBrandTelegram color="white" />
                    </ActionIcon>
                </Group>
            </Center>
        </Group>
    );
};
