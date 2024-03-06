"use client";
import { FC, ReactNode, useState, useEffect } from "react";
import { useAccount } from "wagmi";

export const HasConnectedAccount: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [isVisible, setVisible] = useState(false);
    const { address, connector, isConnected } = useAccount();

    useEffect(() => {
        setVisible(!!address && !!connector && !!isConnected);
    }, [address, connector, isConnected]);

    if (isVisible) {
        return children;
    }
};
