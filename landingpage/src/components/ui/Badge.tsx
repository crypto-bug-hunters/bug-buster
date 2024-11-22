import React from "react";
type Props = {
  label: string;
};
const Badge = ({ label }: Props) => {
  return (
    <span className="inline-block inline-flex rounded-full bg-secondary px-5 py-2 font-heading text-sm uppercase tracking-wide text-primary">
      {label}
    </span>
  );
};

export default Badge;
