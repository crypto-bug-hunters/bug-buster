import React, { FC } from "react";

import {
    Avatar as MantineAvatar,
    Box,
    Badge,
    Button,
    Center,
    Code,
    Group,
    Stack,
    Image,
    Title,
    Tooltip,
    useMantineTheme,
    SimpleGrid,
    Card,
    Text,
    Paper,
} from "@mantine/core";

import { Profile } from "../model/state";

import NiceAvatar, { genConfig } from "react-nice-avatar";

import { CodeWithCopyButton } from "./copy";

export const Avatar: FC<{
    src: string;
    altseed: string;
}> = ({ src, altseed }) => {
    return (
        <MantineAvatar src={src} radius="sl" size="xl">
            <NiceAvatar
                style={{ width: "6rem", height: "6rem" }}
                {...genConfig(altseed)}
            />
        </MantineAvatar>
    );
};

export const ProfileCard: FC<{
    profile: Profile;
    badge?: string;
    badgeColor?: string;
    children?: React.ReactNode;
}> = ({ profile, badge, badgeColor, children }) => {
    return (
        <Card radius="md" shadow="sm">
            <Stack p={20}>
                <Group gap="lg">
                    <Avatar
                        src={profile.ImgLink || ""}
                        altseed={profile.Address}
                    />
                    <Stack>
                        <Group>
                            {badge && (
                                <Badge color={badgeColor || "red"}>
                                    {badge}
                                </Badge>
                            )}
                            <Text fw={500} size="lg">
                                {profile.Name}
                            </Text>
                        </Group>
                        <CodeWithCopyButton value={profile.Address} />
                        <Text fw={700} size="xl" c="dimmend">
                            {children}
                        </Text>
                    </Stack>
                </Group>
            </Stack>
        </Card>
    );
};
