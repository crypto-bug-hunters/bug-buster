import React, { useRef } from 'react';
import Logo from './Logo';
import Container from './ui/Container';
import { useCallback, useEffect, useState } from 'react';
import { useScroll, motion } from 'framer-motion';
import Navigation from './Navigation';
import NavigationHamburger from './ui/NavigationHamburger';
import InfoBar from './ui/InfoBar';
import { InfoBarType } from '../types/types';
import { useMediaQuery, useResizeObserver, useWindowSize } from 'usehooks-ts';

type Props = {
  isWhiteMobile?: boolean;
  infobar?: InfoBarType;
  setHeaderHeight?: any;
  data?: any;
};

const Header = ({ isWhiteMobile, infobar, setHeaderHeight, data }: Props) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)', {
    initializeWithValue: false,
  });

  const update = useCallback(() => {
    const current = scrollY?.get();
    const previous = scrollY?.getPrevious();
    if (current < previous) {
      setHidden(false);
    } else if (current > 50 && current > previous) {
      !isOpen && setHidden(true);
    }

    setIsTop(current <= 50);
  }, [scrollY, isOpen]);

  useEffect(() => {
    scrollY?.on('change', update);
    return () => {
      scrollY?.clearListeners();
    };
  }, [scrollY, update]);

  useEffect(() => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  const variants = {
    initial: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: '-100%' },
  };

  const ref = useRef<HTMLDivElement>(null);
  const { height = 0 } = useResizeObserver({
    ref,
    box: 'border-box',
  });

  const currentWindow = useWindowSize({
    initializeWithValue: false,
  });

  useEffect(() => {
    if (!isClicked) setHeaderHeight(height);
  }, [height, isClicked]);

  useEffect(() => {
    setHeaderHeight(height);
  }, [currentWindow.height, currentWindow.width]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-header-height',
      !hidden ? height + 'px' : '0px'
    );
  }, [hidden, height]);

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-30 flex min-h-headerMobile flex-shrink-0 ${
        infobar?.enabled ? 'flex-col' : ''
      } items-center lg:min-h-headerDesktop`}
      variants={variants}
      initial={isTop ? 'initial' : 'visible'}
      animate={hidden ? 'hidden' : isTop ? 'initial' : 'visible'}
      transition={{ duration: 0.25 }}
      style={{
        backgroundColor:
          (isTop && !isOpen) || isDesktop
            ? 'transparent'
            : 'rgba(255,255,255,0.85)',
        backdropFilter: (isTop && !isOpen) || isDesktop ? 'none' : 'blur(20px)',
      }}
      ref={ref}
    >
      {infobar && infobar.enabled && <InfoBar data={infobar} />}
      <Container>
        <div className='flex flex-col lg:flex-row lg:items-center lg:rounded-xl lg:bg-background/80 lg:px-6 lg:py-2 lg:backdrop-blur'>
          <div className='z-10 inline-flex h-headerMobile flex-shrink-0 items-center lg:h-auto lg:w-[var(--header-side-column-width)]'>
            <Logo />
          </div>
          <Navigation data={data} isOpen={isOpen} isDesktop={isDesktop} />
          <NavigationHamburger
            isWhiteMobile={isOpen || !isTop ? false : isWhiteMobile}
            onClick={() => {
              setIsClicked(true);
              setIsOpen(!isOpen);
            }}
            isOpen={isOpen}
            top={infobar?.enabled ? 4 : 0}
          />
        </div>
      </Container>
    </motion.header>
  );
};

export default Header;
