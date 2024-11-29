import React, { RefAttributes } from 'react';
import { cn } from '../../lib/utils';
import IconExternal from './IconExternal';

type Props = {
  external?: boolean;
  anchor?: boolean;
  children: React.ReactNode;
  to: string;
  className?: string;
  iconExternal?: boolean;
};

const SiteLink = ({
  external,
  iconExternal,
  anchor,
  children,
  to,
  className,
  ...rest
}: Props & RefAttributes<HTMLAnchorElement>) => {
  return (
    <a
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : ''}
      href={to}
      {...rest}
      className={cn(`group inline-flex items-center`, className)}
    >
      {children}

      {iconExternal && <IconExternal />}
    </a>
  );
};

export default SiteLink;
