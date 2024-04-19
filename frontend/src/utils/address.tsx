import { isAddress } from "viem";

if (
    process.env.NEXT_PUBLIC_APPLICATION_CONTRACT_ADDRESS === undefined ||
    process.env.NEXT_PUBLIC_APPLICATION_CONTRACT_ADDRESS == "" ||
    !isAddress(process.env.NEXT_PUBLIC_APPLICATION_CONTRACT_ADDRESS)
) {
    throw new Error("The address of the application contract is required");
}

const appContract = process.env.NEXT_PUBLIC_APPLICATION_CONTRACT_ADDRESS;

export const getDAppAddress = () => {
    return appContract;
};
