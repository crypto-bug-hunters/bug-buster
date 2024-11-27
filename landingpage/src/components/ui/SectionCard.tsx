import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
};

const SectionCardInner = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-background/10 bg-background/5 p-8',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

const SectionCard = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'overflow-hidden py-section lg:mx-8 lg:rounded-3xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

SectionCard.CardInner = SectionCardInner;
export default SectionCard;
