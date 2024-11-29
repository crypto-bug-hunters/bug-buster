import React from 'react';
import { cn } from '../../lib/utils';

type Props = {
  icon: string;
};

const IconCard = ({
  icon,
  className,

  title,
  ...rest
}: Props & React.HTMLAttributes<HTMLImageElement>) => {
  return (
    <div className={'rounded-xl bg-card p-2'}>
      <img src={icon} alt={title} className={cn('mx-auto h-10 w-10', className)} {...rest} />
    </div>
  );
};

export default IconCard;
