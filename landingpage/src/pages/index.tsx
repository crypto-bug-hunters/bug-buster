import React from 'react';
import { Routes } from '../types/types';
import Meta from '../components/Meta';
import Layout from '../components/ui/Layout';
import Hero from '../components/homepage/Hero';
import HeroContainer from '../components/ui/HeroContainer';
import About from '../components/homepage/About';
import Technology from '../components/homepage/Technology';
import Resources from '../components/homepage/Resources';

const data = {
  pageContent: {
    seoMeta: {
      metaTitle: 'Bug Buster - A Trustless Bug Bounty Platform',
      metaDescription:
        'Bug Buster accepts software written in any major programming language. Through a friendly web interface, hackers can test their exploits right on the browser, without even having to sign Web3 transactions! Once the hacker finds a valid exploit, they can finally send a transaction requesting the reward to be transferred to their account. All major wallets are supported!',
      ogImage: {
        asset: {
          url: '/preview-image.webp',
        },
      },
      noindex: false,
    },
    hero: {
      title: 'Your decentralized base for onchain bounties',
      subtitle:
        'Bug Buster is on a mission to help secure developer code with streamlined bounties onchain. Submit and sponsor a bounty, or hack for rewards and clout.',
      cta1: {
        label: 'Bust Some Bugs',
        link: Routes.app,
        isExternal: false,
      },
    },
    about: {
      title:
        'Exterminate bugs from your apps efficiently and transparently, with no need for disputes or mediation. Every bug busted means safer code for web3.',
      list: {
        items: [
          {
            _id: '7fCW3tKCC6QpTStVdxgsRt',
            title: 'For software developers',
            description:
              'Tap into a global network of hackers and secure your app from malicious exploits. Bug Buster’s sponsored bounties incentivize the community to clean up your code. You can even pay hackers in your native token.',
            image: {
              asset: {
                url: '/images/icon-developers.svg',
              },
            },
          },
          {
            _id: '3sHUQpCYe2kYVYih0DrK9F',
            title: 'For hackers',
            description:
              'Big bug bounties await you! Discover vulnerabilities, sharpen your cybersecurity skills, and earn respect from developers. It’s simple: If you meet the requirements and submit a valid exploit, you earn rewards. No hassle, no disputes.',
            image: {
              asset: {
                url: '/images/icon-hackers.svg',
              },
            },
          },
        ],
      },
    },
    technology: {
      headline: 'Bug Buster creates more secure code for web3',
      block: {
        title: 'Here’s how it works ',
        description:
          'There are many ways to become a hero. Eliminate bugs, achieve safer code, and unlock new levels of web3 excellence.',
        disclaimer:
          '* If no valid exploit is found by the operation’s deadline, hacker heroes fall back and regroup.',
        list: {
          items: [
            {
              _id: 'SuVDnHmzCDIF81ojvyGdy',
              title: 'The Mission',
              description:
                "<p>Developers, set the parameters of your test. What part of your software do you want to debug?</p><p class='text-xs'>Tips:</p><ul class='text-xs'><li>Bug Buster accepts applications written in any major programming language</li><li>Bounties rely on assertion scripts to determine the validity of exploits</li></ul>",
              image: {
                asset: {
                  url: '/images/icon-mission.svg',
                },
              },
            },
            {
              _id: 'SuVDnHmzCDIF81ojd34wew',
              title: 'The Bounty',
              description: 'Bug Buster now uses ERC-20 tokens for rewards.',
              image: {
                asset: {
                  url: '/images/icon-bounty.svg',
                },
              },
            },
            {
              _id: 'dsaqwesmzCDIF81ojd34wew',
              title: 'Hack',
              description:
                'Test your exploits right on the browser, without even having to sign web3 transactions.',
              image: {
                asset: {
                  url: '/images/icon-hack.svg',
                },
              },
            },
            {
              _id: 'dsaqwe43242sxojd34wew',
              title: 'Victory',
              description:
                'The first hacker to successfully submit a valid exploit is  rewarded with the bounty, with the payment enforced through smart contracts. Web3 software just got a bit safer and more secure for all.',
              image: {
                asset: {
                  url: '/images/icon-victory.svg',
                },
              },
            },
          ],
        },
      },
    },
    resources: [
      {
        _id: 't0jwavggro',
        title: 'Follow us on X',
        description:
          'Tune in and bug out on all the latest Bug Buster missions.',
        image: {
          asset: {
            url: '/images/follow-x.png',
          },
        },
        cta: {
          label: 'Join the Conversation',
          link: Routes.x,
          isExternal: true,
        },
      },
      {
        _id: 'qilqd0id84',
        title: 'Reach out via Telegram',
        description: 'Join the conversation on Telegram.',
        image: {
          asset: {
            url: '/images/follow-telegram.png',
          },
        },
        cta: {
          label: 'Reach out',
          link: Routes.telegram,
          isExternal: true,
        },
      },
    ],
  },
};

const Homepage = () => {
  const { seoMeta, hero, about, technology, resources } = data.pageContent;
  return (
    <>
      <Meta data={seoMeta} />
      <Layout>
        <HeroContainer>
          <Hero data={hero} />
        </HeroContainer>
        <About data={about} />
        <Technology data={technology} />
        <Resources data={resources} />
      </Layout>
    </>
  );
};

export default Homepage;
