import React from 'react';
import Container from '../ui/Container';
import EntryContent from '../ui/EntryContent';
import SiteLink from '../ui/SiteLink';
import SectionCard from '../ui/SectionCard';
import Button from '../ui/Button';

const Resources = ({ data }) => {
  return (
    <SectionCard className='my-section'>
      <Container>
        {data && (
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-24'>
            {data.map(({ _id, title, image, description, cta }) => (
              <div className='group grid gap-6' key={_id}>
                <SiteLink to={cta.link} external={cta.isExternal}>
                  <div className='aspect-video overflow-hidden rounded-2xl object-cover'>
                    <img
                      src={image.asset.url}
                      alt={title}
                      className='aspect-video object-cover transition-transform duration-1000 group-hover:scale-105'
                    />
                  </div>
                </SiteLink>
                <div className='grid gap-8 pb-6 lg:pb-0'>
                  <SiteLink to={cta.link} external={cta.isExternal}>
                    <EntryContent className='prose-headings:mb-2 prose-headings:text-h5'>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </EntryContent>
                  </SiteLink>
                  <EntryContent className='prose-headings:mb-2 prose-headings:text-h5'>
                    <p>
                      <Button
                        asChild
                        variant={'link'}
                        size={'link'}
                        className='font-semibold uppercase text-primary'
                      >
                        <SiteLink
                          to={cta.link}
                          external={cta.isExternal}
                          iconExternal={cta.isExternal}
                        >
                          {cta.label}
                        </SiteLink>
                      </Button>
                    </p>
                  </EntryContent>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </SectionCard>
  );
};

export default Resources;
