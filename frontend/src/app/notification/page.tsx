import { Anchor, Center, Group, Stack, Text, Title } from "@mantine/core";
import { FC } from "react";

const WordsOfCaution: FC = () => {
    return (
        <Group justify="center">
            <Stack align="center" w="60%">
                <Title mt="lg">
                    🚨Words of caution to our early user adopters🚨
                </Title>
                <Text>
                    Bug Buster is in alpha stage and this means that its
                    development is heavily active thus changes (new features,
                    improvements and fixes) can come anytime.
                </Text>
                <Text>
                    In regards to security, althought Bug Buster is built on top
                    of Cartesi Rollups SDK and its development has been done
                    with care, we cannot guarantee that the platform is free of
                    bugs or vulnerabilities at this stage.
                </Text>
                <Text>
                    To avoid any potential loss of funds, we recommend that you
                    use the platform with scaution, and avoid using it with
                    large amounts of funds.
                </Text>
                <Text>
                    Finally, this is an exciting phase of development and your
                    feedback really matters! Let’s build together a innovative,
                    safer and user-friendly open source bug bounty platform for
                    the web3 industry? 🌟
                </Text>
                <Text>
                    Feel free to explore, ask questions, and provide feedback on
                    our{" "}
                    <Anchor
                        href="https://discord.com/channels/600597137524391947/1166042819782258788"
                        underline="never"
                    >
                        Discord channel
                    </Anchor>{" "}
                    or mention our{" "}
                    <Anchor href="https://x.com/BugBusterApp" underline="never">
                        X account
                    </Anchor>
                    .
                </Text>
            </Stack>
        </Group>
    );
};

export default WordsOfCaution;
