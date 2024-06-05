export type TransactionPrepareStatus = {
    status: "idle" | "loading" | "error" | "success";
    fetchStatus: "fetching" | "idle" | "paused";
    error: Error | null;
};

export type TransactionExecuteStatus = {
    status: "idle" | "loading" | "error" | "success";
    error: Error | null;
};

export type TransactionWaitStatus = {
    status: "idle" | "loading" | "error" | "success";
    fetchStatus: "fetching" | "idle" | "paused";
    error: Error | null;
};

export const transactionStatus = (
    prepare: TransactionPrepareStatus,
    execute: TransactionExecuteStatus,
    wait: TransactionWaitStatus,
) => {
    const loading =
        prepare.fetchStatus === "fetching" ||
        execute.status === "loading" ||
        wait.fetchStatus === "fetching";

    const disabled = prepare.error !== null;

    return { loading, disabled };
};
