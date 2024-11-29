import React from "react";

type Props = {
  style?: string;
};

const IconChevron = ({ style }: Props) => {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 flex-shrink-0 fill-current ${style}`}
    >
      <path
        id="arrow_drop_down_2"
        d="M10.1099 12.5L6.10986 8.5H14.1099L10.1099 12.5Z"
      />
    </svg>
  );
};

export default IconChevron;
