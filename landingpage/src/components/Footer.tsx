import React from 'react';
import Logo from './Logo';
import Container from './ui/Container';
import SiteLink from './ui/SiteLink';
import Button from './ui/Button';

type Props = {
  data: any;
};

const Footer = ({ data }: Props) => {
  const { navItems, appCTA } = data;
  const d = new Date();
  let year = d.getFullYear();

  return (
    <div className='flex-shrink-0 bg-foreground pb-8 pt-section text-sm text-background'>
      <Container>
        <div className='flex flex-col gap-16'>
          <div className='flex flex-col gap-8 lg:flex-row lg:gap-32'>
            <div className='flex grow flex-col gap-6'>
              <Logo footer={true} />
              <p className='text-lg font-thin tracking-wide text-white/80'>
                Powered by Cartesi
              </p>
            </div>
            <div>
              <Button variant={'outline-invert'} asChild size={'lg'}>
                <SiteLink
                  to={appCTA.link}
                  external={appCTA.isExternal}
                  iconExternal={appCTA.isExternal}
                >
                  {appCTA.label}
                </SiteLink>
              </Button>
            </div>
          </div>
          <div className='flex flex-col items-start justify-center gap-6 text-xs text-background/50 lg:items-center'>
            {navItems.navLinks2 && (
              <div className='flex flex-row justify-center gap-6 lg:mx-auto'>
                {navItems.navLinks2.map(
                  ({ _id, label, path, isExternal, icon }) => (
                    <SiteLink
                      external={isExternal}
                      to={path}
                      key={_id}
                      className={`flex flex-row gap-4 ${
                        'bugbuster-' + _id.replaceAll('-', '')
                      }`}
                    >
                      <img
                        src={icon.asset.url2}
                        alt={label}
                        className='h-7 w-7'
                      />
                    </SiteLink>
                  )
                )}
              </div>
            )}
            <p className='text-center'>
              © {year} Bug Buster. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;
