export enum Routes {
  home = '/',
  app = 'https://bugbuster.app/',
  github = 'https://github.com/crypto-bug-hunters/bug-buster',
  x = 'https://x.com/BugBusterApp',
  telegram = 'https://t.me/+G_CPMEhCHC04MzA5',
}

export type CTA = {
  _id?: string;
  label: string;
  link: string;
  isExternal: boolean;
};
export type Image = {
  asset: {
    url: string;
    url2?: string;
  };
};
export type NavLink = {
  _id?: string;
  path: string;
  label: string;
  isExternal: boolean;
  icon: Image;
  Children?: CTA[];
};
export type SeoMeta = {
  metaTitle: string;
  metaDescription: string;
  ogImage?: Image;
  noindex?: boolean;
};
export type InfoBarType = {
  enabled: boolean;
  badge?: string;
  text: string;
  url?: string;
};
