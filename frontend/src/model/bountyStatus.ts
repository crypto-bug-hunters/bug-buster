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
};

export type BountyStatus =
    | BountyLoadingStatus
    | BountyOpenStatus
    | BountyExploitedStatus
    | BountyExpiredStatus;
