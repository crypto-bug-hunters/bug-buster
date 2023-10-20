import { FC } from "react";

import {
    CopyButton,
    Tooltip,
    ActionIcon,
    rem,
    Code,
    Group,
    Text,
} from "@mantine/core";

import { IconCopy, IconCheck } from "@tabler/icons-react";

export const CodeWithCopyButton: FC<{ value: string }> = ({ value }) => {
    return (
        <Group>
            <Code>{value}</Code>
            <CopyButtonWithIcon value={value} />
        </Group>
    );
};

export const CopyButtonWithIcon: FC<{ value: string }> = ({ value }) => {
    return (
        <CopyButton value={value} timeout={2000}>
            {({ copied, copy }) => (
                <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="right"
                >
                    <ActionIcon
                        color={copied ? "teal" : "gray"}
                        variant="subtle"
                        onClick={copy}
                    >
                        {copied ? (
                            <IconCheck style={{ width: rem(16) }} />
                        ) : (
                            <IconCopy style={{ width: rem(16) }} />
                        )}
                    </ActionIcon>
                </Tooltip>
            )}
        </CopyButton>
    );
};
