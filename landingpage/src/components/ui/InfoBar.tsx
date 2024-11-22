import React from "react";
import { InfoBarType } from "../../types/types";
import SiteLink from "../ui/SiteLink";

type Props = {
  data: InfoBarType;
};
const InfoBar = ({ data }: Props) => {
  if (data.url && data.url !== "")
    return (
      <SiteLink
        to={data.url}
        external
        className="mb-0 flex w-full flex-col items-center justify-items-center bg-foreground p-3 text-background lg:mb-[1.5rem]"
      >
        <div className="flex flex-row items-center gap-2">
          {data.badge !== "" && (
            <span className="inline-flex min-w-fit justify-center rounded-full bg-secondary px-3 py-1 text-center font-heading text-sm uppercase tracking-wide text-primary">
              {data.badge}
            </span>
          )}
          {data.text}
        </div>
      </SiteLink>
    );
  else
    return (
      <div className="mb-0 flex w-full flex-col items-center justify-items-center bg-foreground p-3 text-background lg:mb-[1.5rem]">
        <div className="flex flex-row items-center gap-2">
          {data.badge !== "" && (
            <span className="inline-flex min-w-fit justify-center rounded-full bg-secondary px-3 py-1 text-center font-heading text-sm uppercase tracking-wide text-primary">
              {data.badge}
            </span>
          )}
          {data.text}
        </div>
      </div>
    );
};

export default InfoBar;
