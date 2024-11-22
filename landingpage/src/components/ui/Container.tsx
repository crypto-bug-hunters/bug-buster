import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
};

const Container = ({
  children,
  className,
  ...rest
}: Props &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >) => {
  return (
    <div className={cn(`container xl:max-w-screen-xl`, className)} {...rest}>
      {children}
    </div>
  );
};

export default Container;
