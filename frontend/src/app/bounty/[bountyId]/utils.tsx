import { Box, Center } from "@mantine/core";

export type SendExploitParams = {
    params: { bountyId: string };
};

export type BountyParams = {
    params: { bountyId: string };
};

export const InvalidBountyId = () => {
    return (
        <Box p="lg">
            <Center>Invalid bounty ID</Center>
        </Box>
    );
};
