import { useEffect, useState } from 'react';
import { getBlock } from 'viem'
import { usePublicClient } from 'wagmi'

export function useBlockTimestamp() {
    const [timestamp, setTimestamp] = useState<bigint>();
    const publicClient = usePublicClient();
    useEffect(() => {
        publicClient.getBlock().then((block) => {
            setTimestamp(block.timestamp);
        });
    }, [publicClient]);
    return timestamp;
};
