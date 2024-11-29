import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type Props = {
  isNext?: boolean;
  style?: React.CSSProperties;
};

const IconSliderNavigation = ({ isNext, style }: Props) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5 flex-shrink-0 stroke-current", style ?? "", {
        "rotate-180 transform": isNext,
      })}
    >
      <path
        d="M17.4001 16.7998L10.6001 9.99981L17.4001 3.19981"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4001 16.7998L3.6001 9.99981L10.4001 3.19981"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconSliderNavigation;
