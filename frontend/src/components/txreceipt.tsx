import { FC } from "react";

import { Stack, Dialog, Text } from "@mantine/core";

import { BsFillCheckCircleFill } from "react-icons/bs";

interface TxReceiptDialogParams {
    opened: boolean;
    close(): void;
}

export const TxReceiptDialog: FC<TxReceiptDialogParams> = ({
    opened,
    close,
}) => {
    return (
        <Dialog
            opened={opened}
            withCloseButton
            onClose={close}
            size="lg"
            radius="md"
        >
            <Stack align="center">
                <BsFillCheckCircleFill size={30} />
                <Text fw={700} size="lg">
                    Transaction submitted
                </Text>
            </Stack>
        </Dialog>
    );
};
