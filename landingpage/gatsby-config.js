require('dotenv').config({
  path: `../.env.${process.env.NODE_ENV}`,
});

module.exports = {
  flags: {
    DEV_SSR: true,
  },
  siteMetadata: {
    title: `🪲 Bug Buster - A Trustless Bug Bounty Platform`,
    description: `Bug Buster accepts software written in any major programming language. Through a friendly web interface, hackers can test their exploits right on the browser, without even having to sign Web3 transactions! Once the hacker finds a valid exploit, they can finally send a transaction requesting the reward to be transferred to their account. All major wallets are supported!`,
    siteUrl: 'https://bugbuster.app/',
    image: '/preview-image.webp',
    author: `@bugbuster`,
  },
  plugins: [
    // {
    //   resolve: `gatsby-plugin-google-gtag`,
    //   options: {
    //     // You can add multiple tracking ids and a pageview event will be fired for all of them.
    //     trackingIds: [
    //       "UA-124332259-1", // Google Analytics / GA
    //       "AW-10872160451", // Google Ads / Adwords / AW
    //     ],
    //     // This object gets passed directly to the gtag config command
    //     // This config will be shared across all trackingIds
    //     //gtagConfig: {
    //     //  optimize_id: "OPT_CONTAINER_ID",
    //     //  anonymize_ip: true,
    //     //  cookie_expires: 0,
    //     //},
    //     // This object is used for configuration specific to this plugin
    //     pluginConfig: {
    //       // Puts tracking script in the head instead of the body
    //       head: false,
    //       // Setting this parameter is also optional
    //       respectDNT: true,
    //       // Avoids sending pageview hits from custom paths
    //       //exclude: ["/preview/**", "/do-not-track/me/too/"],
    //       // Defaults to https://www.googletagmanager.com
    //       //origin: "YOUR_SELF_HOSTED_ORIGIN",
    //     },
    //   },
    // },
    // {
    //   resolve: "gatsby-plugin-google-tagmanager",
    //   options: {
    //     id: "GTM-MS89D9K",
    //     // Include GTM in development.
    //     //
    //     // Defaults to false meaning GTM will only be loaded in production.
    //     includeInDevelopment: false,
    //     // datalayer to be set before GTM is loaded
    //     // should be an object or a function that is executed in the browser
    //     //
    //     // Defaults to null
    //     defaultDataLayer: { platform: "gatsby" },
    //     // Specify optional GTM environment details.
    //     //gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_AUTH_STRING",
    //     //gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_PREVIEW_NAME",
    //     //dataLayerName: "YOUR_DATA_LAYER_NAME",
    //     // Name of the event that is triggered
    //     // on every Gatsby route change.
    //     //
    //     // Defaults to gatsby-route-change
    //     routeChangeEventName: "cartesi-route-change",
    //     // Defaults to false
    //     enableWebVitalsTracking: true,
    //     // Defaults to https://www.googletagmanager.com
    //     //selfHostedOrigin: "YOUR_SELF_HOSTED_ORIGIN",
    //   },
    // },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images`,
      },
    },
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `./src/assets/images/`,
      },
    },
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          quality: 90,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Cartesi`,
        short_name: `Cartesi`,
        start_url: `/`,
        background_color: `#1E1941`,
        theme_color: `#FFFAE6`,
        display: `standalone`,
        icon: `src/assets/images/favicon.svg`,
        icon_options: {
          purpose: `any`,
        },
      },
    },
    'gatsby-plugin-postcss',
    `gatsby-plugin-sitemap`,
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://bugbuster.app/',
        sitemap: 'https://bugbuster.app/sitemap.xml',
        policy: [{ userAgent: '*', allow: '/' }],
      },
    },
  ],
};
