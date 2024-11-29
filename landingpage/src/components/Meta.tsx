import React from 'react';
import { Helmet } from 'react-helmet';
import { SeoMeta } from '../types/types';

type Props = {
  data: SeoMeta;
};

const Meta = ({ data }: Props) => {
  const image = data.ogImage ? data.ogImage.asset.url : '/preview-image.webp';
  return (
    <Helmet>
      <title>{data.metaTitle}</title>
      <meta name='description' content={data.metaDescription} />
      <meta property='og:title' content={data.metaTitle} />
      <meta property='og:description' content={data.metaDescription} />
      {image && <meta property='og:image' content={image} />}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@BugBusterApp' />
      <meta name='twitter:title' content={data.metaTitle} />
      <meta name='twitter:description' content={data.metaDescription} />
      {image && <meta name='twitter:image' content={image} />}
      {data.noindex == true && (
        <meta name='robots' content='noindex, nofollow' />
      )}
    </Helmet>
  );
};

export default Meta;
