import React from 'react';
import { NavLink, Routes } from '../types/types';
import Button from './ui/Button';
import SiteLink from './ui/SiteLink';
import { motion } from 'framer-motion';
import NavigationItem from './ui/NavigationItem';
import Container from './ui/Container';
import { isExternal } from 'util/types';

type Props = {
  isOpen: boolean;
  isDesktop: boolean;
  data: any;
};

const Navigation = ({ isOpen, isDesktop, data }: Props) => {
  const variants = {
    open: { height: 'auto' },
    closed: { height: '0' },
  };

  const { navLinks2 } = data.navItems;

  return (
    <>
      <motion.div
        className='relative left-0 top-0 grow overflow-hidden lg:left-auto lg:!h-auto lg:flex-row lg:overflow-visible'
        variants={variants}
        initial={isDesktop ? 'open' : 'closed'}
        animate={isOpen ? 'open' : isDesktop ? 'open' : 'closed'}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Container className='mx-auto flex grow flex-col gap-8 py-4 sm:py-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:p-0'>
          {/* <nav className="flex h-full grow flex-col justify-center font-heading lg:mx-auto lg:flex-row lg:items-center">
            {navLinks.map((item: NavLink, i: number) => (
              <NavigationItem item={item} isDesktop={isDesktop} key={i} />
            ))}
          </nav> */}
          {navLinks2 && (
            <div className='flex flex-col lg:ml-auto lg:w-[var(--header-side-column-width)] lg:flex-row lg:justify-end lg:gap-6'>
              {navLinks2.map(({ _id, label, path, isExternal, icon }) => (
                <SiteLink
                  external={isExternal}
                  to={path}
                  key={_id}
                  className={`flex flex-row gap-4 border-b border-neutral-300 p-4 last:border-b-0 lg:border-b-0 lg:p-0 ${
                    'bugbuster-' + _id.replaceAll('-', '')
                  }`}
                >
                  <img src={icon.asset.url} alt={label} className='h-5 w-5' />
                  <span className='inline-block lg:hidden'>{label}</span>
                </SiteLink>
              ))}
            </div>
          )}
        </Container>
      </motion.div>
    </>
  );
};

export default Navigation;
