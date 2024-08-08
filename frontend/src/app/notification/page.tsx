import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import { FC } from "react";
import { TELEGRAM_CHANNEL_URL, X_ACCOUNT_URL } from "../../utils/links";

const WordsOfCaution: FC = () => {
    return (
        <Group justify="center">
            <Stack align="center" w="60%">
                <Title mt="lg">
                    🚨 Considerations for early user adopters 🚨
                </Title>
                <Text>
                    Bug Buster is in alpha stage, which means its development is
                    heavily active, and changes (such as fixes and improvements)
                    can come at any time.
                </Text>
                <Text>
                    Regarding security, Bug Buster is built on top of the
                    Cartesi Rollups SDK and developed with meticulous care and
                    attention to detail. However, we cannot guarantee that the
                    platform is entirely free of bugs or vulnerabilities at this
                    stage.
                </Text>
                <Text>
                    To avoid any potential loss of funds, we recommend that you
                    use the platform with caution, and avoid depositing large
                    amounts of funds.
                </Text>
                <Text>
                    Nevertheless, this is an exciting phase of development and
                    your feedback really matters! Together, let&apos;s build an
                    innovative, safer, and user-friendly open-source bug bounty
                    platform for the Web3 industry.🌟
                </Text>
                <Text>
                    Feel free to explore, ask questions, and provide feedback on
                    our{" "}
                    <Anchor href={TELEGRAM_CHANNEL_URL} underline="never">
                        Telegram group
                    </Anchor>{" "}
                    or message us on our{" "}
                    <Anchor href={X_ACCOUNT_URL} underline="never">
                        X account
                    </Anchor>
                    .
                </Text>
            </Stack>
        </Group>
    );
};

export default WordsOfCaution;
