// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
    '@nuxt/icon'
  ],

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700, 800, 900],
      'Plus Jakarta Sans': [300, 400, 500, 600, 700, 800]
    }
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'DigiHub - E-commerce Channel Connector & Logistics Management',

      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Enterprise-grade multi-marketplace synchronization and logistics platform. Streamline e-commerce operations across multiple sales channels with real-time inventory sync, automated order processing, and multi-carrier shipping integration.'
        },
        { name: 'keywords', content: 'e-commerce, logistics, multi-channel, inventory management, order processing, shipping integration, Shopify, WooCommerce, Amazon' },
        { property: 'og:title', content: 'DigiHub - E-commerce Channel Connector & Logistics Management' },
        { property: 'og:description', content: 'Enterprise-grade multi-marketplace synchronization and logistics platform for streamlined e-commerce operations.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'DigiHub - E-commerce Channel Connector & Logistics Management' },
        { name: 'twitter:description', content: 'Enterprise-grade multi-marketplace synchronization and logistics platform for streamlined e-commerce operations.' }
      ],

      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],

      // ✅ GOOGLE ANALYTICS
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-F0MJT64MVT',
          async: true
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F0MJT64MVT');
          `
        }

      ]
    }
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://digihub.com'
    }
  }
})
