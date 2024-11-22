import React from "react";
import { cn } from "../../lib/utils";

type Props = {
  style?: React.CSSProperties;
};

const IconArrowRight = ({ style }: Props) => {
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 18 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5 flex-shrink-0 fill-current", style ?? "")}
    >
      <path d="M17.7071 8.70711C18.0976 8.31658 18.0976 7.68342 17.7071 7.29289L11.3431 0.928932C10.9526 0.538408 10.3195 0.538408 9.92893 0.928932C9.53841 1.31946 9.53841 1.95262 9.92893 2.34315L15.5858 8L9.92893 13.6569C9.53841 14.0474 9.53841 14.6805 9.92893 15.0711C10.3195 15.4616 10.9526 15.4616 11.3431 15.0711L17.7071 8.70711ZM0 9H17V7H0V9Z" />
    </svg>
  );
};

export default IconArrowRight;
