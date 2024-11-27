import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
};

const SectionCardDarkInner = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'border-b border-background/10 py-8 first:pt-0 last:border-0 last:pb-0 sm:rounded-[1rem] sm:border sm:bg-background/5 sm:p-8 first:sm:pt-8 last:sm:border last:sm:pb-8',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

const SectionCardDark = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('rounded-[2rem] bg-foreground p-section', className)}
      {...rest}
    >
      {children}
    </div>
  );
};

SectionCardDark.CardInner = SectionCardDarkInner;
export default SectionCardDark;
