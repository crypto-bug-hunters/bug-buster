import { AppBounty } from "../../../model/state";

export type BountyParams = {
    params: { bountyId: string };
};

export type ConcreteBountyParams = {
    bountyIndex: number;
    bounty: AppBounty;
};
