import React, { useState } from 'react';
import { Routes } from '../../types/types';
import Header from '../Header';
import Content from './Content';
import Footer from '../Footer';

type Props = {
  children: React.ReactNode;
  headerWhiteMobile?: boolean;
};

const data = {
  infobar: {
    enabled: false,
    badge: '',
    text: '',
    url: '',
  },
  appCTA: {
    label: 'Bust Some Bugs',
    link: process.env.ROUTE_APP ? process.env.ROUTE_APP : Routes.app,
    isExternal: false,
  },
  navItems: {
    navLinks2: [
      {
        _id: 'nav-1',
        path: process.env.ROUTE_GITHUB
          ? process.env.ROUTE_GITHUB
          : Routes.github,
        label: 'GitHub',
        icon: {
          asset: {
            url: '/images/icon-github.svg',
            url2: '/images/icon-github-white.svg',
          },
        },
        isExternal: true,
      },
      {
        _id: 'nav-2',
        path: process.env.ROUTE_X ? process.env.ROUTE_X : Routes.x,
        label: 'X.com',
        icon: {
          asset: {
            url: '/images/icon-x.svg',
            url2: '/images/icon-x-white.svg',
          },
        },
        isExternal: true,
      },
      {
        _id: 'nav-3',
        path: process.env.ROUTE_TELEGRAM
          ? process.env.ROUTE_TELEGRAM
          : Routes.telegram,
        label: 'Telegram',
        icon: {
          asset: {
            url: '/images/icon-telegram.svg',
            url2: '/images/icon-telegram-white.svg',
          },
        },
        isExternal: true,
      },
    ],
  },
};

const Layout = ({ children, headerWhiteMobile = false }: Props) => {
  const infobar = {
    enabled: data.infobar ? data.infobar?.enabled : false,
    badge: data.infobar?.badge,
    text: data.infobar?.text,
    url: data.infobar?.url,
  };

  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <div className='flex min-h-screen flex-col'>
      <Header
        infobar={infobar}
        isWhiteMobile={headerWhiteMobile}
        setHeaderHeight={setHeaderHeight}
        data={data}
      />
      <Content infobar={infobar.enabled} headerHeight={headerHeight}>
        {children}
      </Content>
      <Footer data={data} />
    </div>
  );
};

export default Layout;
