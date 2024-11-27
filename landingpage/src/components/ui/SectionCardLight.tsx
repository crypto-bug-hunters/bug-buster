import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
};

const SectionCardLightInner = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-tertiary/20 bg-background p-8',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

const SectionCardLight = ({
  children,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'rounded-0 -mx-[1rem] bg-card p-section sm:mx-auto sm:rounded-2xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

SectionCardLight.CardInner = SectionCardLightInner;
export default SectionCardLight;
