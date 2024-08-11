"use client";
import { FC, useState, useEffect } from "react";

import {
    Box,
    Button,
    Center,
    Stack,
    Title,
    TextInput,
    Textarea,
    useMantineTheme,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { isNotEmpty, useForm } from "@mantine/form";
import { isAddress, zeroAddress } from "viem";

import { useInputBoxAddInput } from "../../../hooks/contracts";
import { useWaitForTransaction } from "wagmi";
import { CreateAppBounty } from "../../../model/inputs";
import { usePrepareCreateBounty } from "../../../hooks/bug-buster";
import { useBlockTimestamp } from "../../../hooks/block";
import { transactionStatus } from "../../../utils/transactionStatus";

interface CreateBountyFormValues {
    name?: string;
    description?: string;
    imgLink?: string;
    deadline?: Date;
    codeZipBinary?: string;
    codeZipPath?: string;
    token?: string;
}

const CreateBountyForm: FC = () => {
    const [minDeadline, setMinDeadline] = useState<Date>();
    const blockTimestamp = useBlockTimestamp();

    useEffect(() => {
        if (blockTimestamp === undefined) {
            setMinDeadline(undefined);
        } else {
            const blockDate = new Date(Number(blockTimestamp * 1000n));
            blockDate.setDate(blockDate.getDate() + 1);
            setMinDeadline(blockDate);
        }
    }, [blockTimestamp]);

    const form = useForm({
        initialValues: {} as CreateBountyFormValues,
        transformValues: (values) => {
            const { deadline, token } = values;
            return {
                ...values,
                token:
                    token !== undefined && isAddress(token) ? token : undefined,
                deadline:
                    deadline !== undefined
                        ? deadline.getTime() / 1000
                        : undefined,
            };
        },
        validateInputOnChange: true,
        validateInputOnBlur: true,
        validate: {
            name: isNotEmpty("A name is required"),
            description: isNotEmpty("A description is required"),
            deadline: isNotEmpty("A deadline is required"),
            codeZipPath: isNotEmpty("A code path is required"),
            token: (token) => {
                if (token === undefined) {
                    return "A token address is required";
                } else {
                    if (isAddress(token)) {
                        return null;
                    } else {
                        return "Invalid token address";
                    }
                }
            },
        },
    });

    const { name, description, deadline, token } = form.getTransformedValues();

    const bounty: CreateAppBounty = {
        ...form.values,
        name: name ?? "",
        description: description ?? "",
        deadline: deadline ?? 0,
        token: token ?? zeroAddress,
    };

    const addInputPrepare = usePrepareCreateBounty(bounty);

    const addInputWrite = useInputBoxAddInput(addInputPrepare.config);

    const addInputWait = useWaitForTransaction({
        hash: addInputWrite.data?.hash,
    });

    const { disabled: addInputDisabled, loading: addInputLoading } =
        transactionStatus(addInputPrepare, addInputWrite, addInputWait);

    return (
        <form>
            <Stack style={{ maxWidth: 800 }}>
                <Title>Create bounty</Title>
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Name"
                    description="If applicable, add the version"
                    placeholder="Hello World 1.0.0"
                    {...form.getInputProps("name")}
                />
                <Textarea
                    withAsterisk
                    size="lg"
                    label="Description"
                    description="Describe the application, exploit format, assertion script, etc"
                    {...form.getInputProps("description")}
                />
                <TextInput
                    size="lg"
                    label="Image URL"
                    description="An image that visually represents your application (optional)"
                    placeholder="https://"
                    {...form.getInputProps("imgLink")}
                />
                <TextInput
                    withAsterisk
                    size="lg"
                    label="Token address"
                    description="Your bounty will be sponsored with this ERC-20 token"
                    placeholder="0x"
                    {...form.getInputProps("token")}
                />
                <DateInput
                    withAsterisk
                    size="lg"
                    label="Deadline"
                    description="Past this date, if no exploit has been found, sponsors will be able to request a refund"
                    minDate={minDeadline}
                    {...form.getInputProps("deadline")}
                />
                <TextInput
                    size="lg"
                    label="Bundle path"
                    placeholder="/path/to/bundle.tar.xz"
                    description="Path to the bounty bundle in the machine filesystem"
                    {...form.getInputProps("codeZipPath")}
                />
                <Button
                    size="lg"
                    disabled={
                        addInputDisabled ||
                        !form.isValid() ||
                        addInputWait.isSuccess
                    }
                    loading={addInputLoading}
                    onClick={() => addInputWrite.write && addInputWrite.write()}
                >
                    Create
                </Button>
            </Stack>
        </form>
    );
};

const CreateBountyPage: FC = () => {
    const theme = useMantineTheme();
    return (
        <Center>
            <Box p={20} mt={50} bg={theme.colors.dark[7]}>
                <CreateBountyForm />
            </Box>
        </Center>
    );
};

export default CreateBountyPage;
