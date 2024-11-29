import React from "react";
import { motion } from "framer-motion";

type Props = {
  open: boolean;
};

const IconCollapse = ({ open }: Props) => {
  return (
    <span className="relative flex h-4 w-4 items-center justify-center">
      <motion.span className="block h-[2px] w-4 bg-foreground group-hover:bg-tertiary" />
      <motion.span
        className="absolute block h-[2px] w-4 origin-center bg-foreground group-hover:bg-tertiary"
        initial={false}
        animate={{ rotate: open ? 0 : 90 }}
      />
    </span>
  );
};

export default IconCollapse;
