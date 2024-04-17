type BountyLoadingStatus = {
    kind: "loading";
};

type BountyOpenStatus = {
    kind: "open";
    daysLeft: bigint;
};

type BountyExploitedStatus = {
    kind: "exploited";
};

type BountyExpiredStatus = {
    kind: "expired";
    withdrawn: boolean;
};

export type BountyStatus =
    | BountyLoadingStatus
    | BountyOpenStatus
    | BountyExploitedStatus
    | BountyExpiredStatus;
