import React from 'react';
import Container from '../ui/Container';
import EntryContent from '../ui/EntryContent';
import EyebrowTitle from '../ui/EyebrowTitle';
import Section from '../../components/ui/Section';
import Button from '../ui/Button';
import SectionCardDark from '../ui/SectionCardDark';
import SiteLink from '../ui/SiteLink';

const Block = ({ data }) => {
  const { title, description, disclaimer, cta, list } = data;
  return (
    <SectionCardDark>
      <div className='mb-section grid gap-8 lg:grid-cols-2'>
        <EntryContent inverted className='max-w-sm prose-headings:text-h2'>
          <h3>{title}</h3>
        </EntryContent>
        <div className='grid gap-8'>
          <EntryContent inverted>
            <p>{description}</p>
          </EntryContent>
          {cta && (
            <p className='text-background'>
              <Button asChild variant={'link-invert'} size={'link'}>
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
      </div>
      <div className='mt-section grid gap-6'>
        <div className='grid gap-6 sm:grid-cols-2'>
          {list.items.map(
            ({ _id, title, description, image }, index: number) => (
              <SectionCardDark.CardInner key={_id}>
                <div className='mb-2 flex h-12 w-12 items-center justify-center'>
                  <img src={image.asset.url} alt={title} />
                </div>
                <EntryContent
                  inverted
                  className='prose-headings:mb-2 prose-headings:text-lg prose-headings:uppercase'
                >
                  <h3>{title}</h3>
                  <div dangerouslySetInnerHTML={{ __html: description }} />
                </EntryContent>
              </SectionCardDark.CardInner>
            )
          )}
        </div>
      </div>
      <EntryContent inverted className='mx-auto mt-8 max-w-[500px]'>
        {disclaimer}
      </EntryContent>
    </SectionCardDark>
  );
};

const Technology = ({ data }) => {
  const { badge, headline, block } = data;
  return (
    <Section className='pb-0'>
      <Container>
        <div className='mx-auto mb-section flex max-w-screen-md flex-col items-center text-center'>
          {badge && <EyebrowTitle label={badge} as='p' />}
          <EntryContent>
            <h2>{headline}</h2>
          </EntryContent>
        </div>
        <div className='flex flex-col gap-8 sm:gap-16'>
          <Block data={block} />
        </div>
      </Container>
    </Section>
  );
};

export default Technology;
