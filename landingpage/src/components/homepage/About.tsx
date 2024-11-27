import React from 'react';
import Button from '../ui/Button';
import Container from '../ui/Container';
import EntryContent from '../ui/EntryContent';
import SiteLink from '../ui/SiteLink';
import IconCard from '../ui/IconCard';
import Section from '../ui/Section';
import { useMediaQuery } from 'usehooks-ts';

const About = ({ data }) => {
  const { title, cta, list } = data;
  const isDesktop = useMediaQuery('(min-width: 1024px)', {
    initializeWithValue: false,
  });

  return (
    <Section>
      <Container>
        <div className='grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-32'>
          <div className='flex flex-col gap-10'>
            <EntryContent>
              <h2>{title}</h2>
            </EntryContent>
            {isDesktop && cta && (
              <p>
                <Button asChild size={'lg'}>
                  <SiteLink
                    to={cta.link}
                    external={cta.isExternal}
                    iconExternal={cta.isExternal}
                  >
                    {cta.label}
                  </SiteLink>
                </Button>
              </p>
            )}
          </div>
          <div className='flex flex-col gap-8'>
            {list.items.map(({ _id, title, description, image }) => (
              <div className='flex gap-8' key={_id}>
                <div className='flex-shrink-0'>
                  <IconCard icon={image.asset.url} title={title} />
                </div>
                <EntryContent className='prose-headings:mb-2 prose-headings:text-lg'>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </EntryContent>
              </div>
            ))}
          </div>
          {!isDesktop && cta && (
            <p className='mb-6 text-center'>
              <Button asChild size={'lg'}>
                <SiteLink
                  to={cta.link}
                  external={cta.isExternal}
                  iconExternal={cta.isExternal}
                >
                  {cta.label}
                </SiteLink>
              </Button>
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default About;
