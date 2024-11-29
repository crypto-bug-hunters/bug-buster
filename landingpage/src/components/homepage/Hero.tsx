import React from 'react';
import EntryContent from '../ui/EntryContent';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { motion } from 'framer-motion';
import SiteLink from '../ui/SiteLink';
import { StaticImage } from 'gatsby-plugin-image';

const Hero = ({ data }) => {
  const { title, subtitle, cta1 } = data;
  return (
    <>
      <Container className='relative z-10 grow pt-[5vmin]'>
        <div className='mx-auto max-w-lg xl:max-w-screen-lg'>
          <EntryContent className='text-center text-h5 prose-headings:mb-1 prose-p:mx-auto prose-p:max-w-2xl prose-p:leading-snug prose-p:text-foreground'>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <div className='flex items-center justify-center gap-2'>
              <Button asChild size={'lg'}>
                <SiteLink
                  to={cta1.link}
                  external={cta1.isExternal}
                  iconExternal={cta1.isExternal}
                >
                  {cta1.label}
                </SiteLink>
              </Button>
            </div>
          </EntryContent>
        </div>
      </Container>
      <motion.div className='absolute bottom-0 left-0 h-full w-full'>
        <StaticImage
          loading='eager'
          width={4000}
          height={2090}
          class='!absolute bottom-0 !h-[60%] w-full object-cover object-left lg:!h-full lg:object-top'
          imgClassName='h-full w-auto object-cover object-left lg:object-top'
          src='../../assets/images/homepage/hero.png'
          alt=''
          quality={100}
          placeholder='none'
        />
      </motion.div>
    </>
  );
};

export default Hero;
