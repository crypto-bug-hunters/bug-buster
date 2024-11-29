import { createElement } from "react";
import { cn } from "../../lib/utils";

type Props = {
  as?: keyof JSX.IntrinsicElements;
  label: string;
  center?: boolean;
  className?: string;
};

const EyebrowTitle = ({ as, label, center = true, className }: Props) => {
  const component = as || "div";

  return createElement(component, {
    className: cn(
      `${
        center ? "items-center" : ""
      } before:bg-tertiary before:w-1/3 before:h-[0.3rem] flex flex-col gap-5 text-[0.75rem] md:text-sm uppercase tracking-wide text-tertiary font-semibold inline-flex font-heading mb-6 lg:mb-8`,
      className
    ),
    children: label,
  });
};

export default EyebrowTitle;
