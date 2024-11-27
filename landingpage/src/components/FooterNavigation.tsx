import React from 'react';
import SiteLink from './ui/SiteLink';

type navItem = {
  _id: string;
  label: string;
  path: string;
  isExternal?: boolean;
  icon?: any;
  attachment?: any;
};

type Props = {
  navItems: {
    _rawNavPanel1: navItem[];
    _rawNavPanel2: navItem[];
    _rawNavPanel3: navItem[];
    _rawNavPanel4: navItem[];
  };
};

const FooterNavigation = ({ navItems }: Props) => {
  return (
    <>
      <div className='grid grow grid-cols-2 gap-8'>
        <div className='flex flex-col gap-4'>
          {navItems._rawNavPanel1 &&
            navItems._rawNavPanel1.map(
              ({ _id, label, path, attachment, isExternal }) => (
                <SiteLink
                  external={isExternal}
                  to={attachment?.asset.url ? attachment.asset.url : path}
                  key={_id}
                  className={'ctsi-' + _id.replaceAll('-', '')}
                >
                  {label}
                </SiteLink>
              )
            )}
        </div>
        <div className='flex flex-col gap-4'>
          {navItems._rawNavPanel2 &&
            navItems._rawNavPanel2.map(
              ({ _id, label, path, attachment, isExternal }) => (
                <SiteLink
                  external={isExternal}
                  to={attachment?.asset.url ? attachment.asset.url : path}
                  key={_id}
                  className={'ctsi-' + _id.replaceAll('-', '')}
                >
                  {label}
                </SiteLink>
              )
            )}
        </div>
      </div>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-row gap-4'>
          {navItems._rawNavPanel3 &&
            navItems._rawNavPanel3.map(
              ({ _id, label, path, isExternal, icon }) => (
                <SiteLink
                  external={isExternal}
                  to={path}
                  key={_id}
                  className={`mx-2 h-5 w-5 ${
                    'ctsi-' + _id.replaceAll('-', '')
                  }`}
                >
                  <img src={icon.asset.url} alt={label} className='h-5 w-5' />
                </SiteLink>
              )
            )}
        </div>
        <div className='flex flex-row gap-4'>
          {navItems._rawNavPanel4 &&
            navItems._rawNavPanel4.map(
              ({ _id, label, path, isExternal, icon }) => (
                <SiteLink
                  external={isExternal}
                  to={path}
                  key={_id}
                  className={`mx-2 h-5 w-5 ${
                    'ctsi-' + _id.replaceAll('-', '')
                  }`}
                >
                  <img src={icon.asset.url} alt={label} className='h-5 w-5' />
                </SiteLink>
              )
            )}
        </div>
      </div>
    </>
  );
};

export default FooterNavigation;
