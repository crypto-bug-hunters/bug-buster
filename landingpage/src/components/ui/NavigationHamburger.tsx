import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

type Props = {
  isOpen?: boolean;
  isWhiteMobile?: boolean;
  top?: number;
};

const NavigationHamburger = ({
  isOpen = false,
  isWhiteMobile,
  top = 0,
  onClick,
  ...rest
}: Props & React.HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`absolute right-0 top-${top} z-10 flex h-headerMobile w-headerMobile  items-center  justify-center lg:hidden`}
      onClick={onClick}
      {...rest}
    >
      <motion.span
        className='flex flex-col items-center justify-center gap-2'
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        <motion.span
          style={{ transformOrigin: 'calc(50% + 7px)' }}
          animate={{ rotate: isOpen ? '-45deg' : 0 }}
        >
          <span
            className={cn(
              'block h-[2px] w-6 flex-shrink-0 transition-colors',
              isWhiteMobile ? 'bg-background' : 'bg-foreground'
            )}
            aria-hidden='true'
          />
        </motion.span>
        <motion.span
          style={{ transformOrigin: 'calc(50% + 7px)' }}
          animate={{ rotate: isOpen ? '45deg' : 0 }}
        >
          <span
            className={cn(
              'block h-[2px] w-6 flex-shrink-0 transition-colors',
              isWhiteMobile ? 'bg-background' : 'bg-foreground'
            )}
            aria-hidden='true'
          />
        </motion.span>
      </motion.span>
    </button>
  );
};

export default NavigationHamburger;
