"use client";
import { FC, ReactNode } from "react";

import { Button } from "@mantine/core";

interface LinkButtonParams {
    href: string;
    disabled?: boolean;
    children: ReactNode;
}

export const LinkButton: FC<LinkButtonParams> = ({
    href,
    disabled,
    children,
}) => {
    return (
        <Button
            component="a"
            href={href}
            data-disabled={disabled}
            onClick={disabled ? (event) => event.preventDefault() : undefined}
        >
            {children}
        </Button>
    );
};
