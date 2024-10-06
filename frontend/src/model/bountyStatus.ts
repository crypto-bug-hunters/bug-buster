type BountyLoadingStatus = {
    kind: "loading";
};

type BountyOpenStatus = {
    kind: "open";
    daysLeft: bigint;
};

type BountySolvedStatus = {
    kind: "solved";
};

type BountyExpiredStatus = {
    kind: "expired";
    withdrawn: boolean;
};

type BountyBugStatus = {
    kind: "bug";
}

type BountyRLModelStatus = {
    kind: "model";
}

export type BountyStatus =
    | BountyLoadingStatus
    | BountyOpenStatus
    | BountySolvedStatus
    | BountyExpiredStatus
    | BountyBugStatus
    | BountyRLModelStatus;
