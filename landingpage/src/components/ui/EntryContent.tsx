import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
};

const EntryContent = ({
  children,
  className,
  inverted,
  ...rest
}: Props & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return (
    <div
      className={cn(`prose max-w-none prose-headings:font-heading`, inverted && 'prose-invert', className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export default EntryContent;
