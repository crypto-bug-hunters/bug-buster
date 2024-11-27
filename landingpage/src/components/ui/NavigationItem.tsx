import React from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import IconChevron from './IconChevron';
import IconExternal from './IconExternal';
import SiteLink from './SiteLink';
import { NavLink } from '../../types/types';

const NavigationItem = ({
  isDesktop,
  item,
}: {
  isDesktop: boolean;
  item: NavLink;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const variantsMobile = {
    open: { height: 'auto', display: 'flex', opacity: 1, scale: 1 },
    closed: {
      height: 0,
      opacity: 1,
      scale: 1,
      transitionEnd: { display: 'none' },
    },
  };

  const variantsDesktop = {
    open: { height: 'auto', opacity: 1, scale: 1, display: 'flex' },
    closed: {
      height: 'auto',
      opacity: 0,
      scale: 0.8,
      transitionEnd: { display: 'none' },
    },
  };

  const variants = isDesktop ? variantsDesktop : variantsMobile;

  return (
    <motion.div
      className='relative block'
      onHoverStart={() => {
        isDesktop ? setIsOpen(true) : null;
      }}
      onHoverEnd={() => {
        isDesktop ? setIsOpen(false) : null;
      }}
      onClick={() => {
        !isDesktop ? setIsOpen(!isOpen) : null;
      }}
    >
      {item.path ? (
        <SiteLink
          to={item.path}
          className={`inline-flex h-full items-center py-4 hover:opacity-90 lg:p-4 ${
            'ctsi-' + item._id?.replaceAll('-', '')
          }`}
        >
          {item.label}
          {item.Children && item.Children.length > 0 ? (
            <motion.span
              animate={{
                rotate: isOpen ? 180 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: 'easeInOut',
              }}
              className='flex-shrink-0'
              aria-hidden
            >
              <IconChevron />
            </motion.span>
          ) : null}
        </SiteLink>
      ) : (
        <span
          className={`inline-flex h-full cursor-pointer items-center py-4 hover:opacity-90 lg:p-4 ${
            'ctsi-' + item._id?.replaceAll('-', '')
          }`}
        >
          {item.label}
          {item.Children && (
            <motion.span
              animate={{
                rotate: isOpen ? 180 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: 'easeInOut',
              }}
              className='flex-shrink-0'
              aria-hidden
            >
              <IconChevron />
            </motion.span>
          )}
        </span>
      )}
      {item.Children && item.Children.length > 0 ? (
        <motion.div
          className='relative z-40 flex w-full flex-col overflow-hidden text-foreground lg:absolute lg:top-full lg:w-max lg:rounded-lg lg:bg-background lg:shadow-2xl'
          initial='closed'
          animate={isOpen ? 'open' : 'closed'}
          variants={variants}
        >
          {item.Children &&
            item.Children.map((child, j) => {
              return (
                <SiteLink
                  to={child.link}
                  className={`gap-2 rounded-xl p-4 text-sm hover:bg-secondary hover:text-secondary-foreground lg:rounded-none lg:px-6 lg:py-4 ${
                    'ctsi-' + child._id?.replaceAll('-', '')
                  }`}
                  external={child.isExternal}
                  key={j}
                >
                  {child.label}
                  {child.isExternal && <IconExternal className='h-4 w-4' />}
                </SiteLink>
              );
            })}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default NavigationItem;
