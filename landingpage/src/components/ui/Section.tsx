import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
};

const Section = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <section
      className={cn('flex flex-col justify-center py-section', className)}
      {...rest}
    >
      {children}
    </section>
  );
};

export default Section;
