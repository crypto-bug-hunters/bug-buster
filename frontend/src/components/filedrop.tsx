import React, { FC } from "react";

import { Group, Paper } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { Accept } from "react-dropzone-esm";
import { TbExclamationCircle, TbUpload } from "react-icons/tb";

interface FileDropParams {
    onDrop(files: FileWithPath[]): void;
    accept?: string[] | Accept;
    children: React.ReactNode;
}

export const FileDrop: FC<FileDropParams> = ({ onDrop, accept, children }) => {
    return (
        <Paper withBorder shadow="sm" radius="sm">
            <Dropzone onDrop={onDrop} accept={accept}>
                <Group justify="left" m={20} style={{ pointerEvents: "none" }}>
                    <Dropzone.Accept>
                        <TbUpload size={60} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <TbExclamationCircle size={60} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <TbUpload size={60} />
                    </Dropzone.Idle>
                    {children}
                </Group>
            </Dropzone>
        </Paper>
    );
};
