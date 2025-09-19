# DigiHub Landing Page

Modern, responsive landing page for DigiHub ChannelConnector & Logistics Management System built with Nuxt.js.

## Features

- 🎨 Modern, eye-catching design with gradient backgrounds
- 📱 Fully responsive across all devices
- ⚡ Built with Nuxt.js 3 for optimal performance
- 🎯 SEO optimized with meta tags and structured data
- 🌈 Beautiful UI components with Tailwind CSS
- 🔧 Easy to customize and extend
- 📄 Multiple pages: Home, About, Contact

## Tech Stack

- **Framework**: Nuxt.js 3
- **Styling**: Tailwind CSS
- **Icons**: Heroicons via @nuxt/icon
- **Fonts**: Inter & Plus Jakarta Sans via Google Fonts
- **SEO**: @nuxtjs/seo for enhanced SEO capabilities

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate
```

## Project Structure

```
landing/
├── assets/css/          # Global styles
├── components/          # Vue components
├── pages/              # Page components
├── public/             # Static assets
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Dependencies
```

## Pages

- **Home** (`/`) - Main landing page with features, stats, and CTAs
- **About** (`/about`) - Company story, mission, values, and team
- **Contact** (`/contact`) - Contact form and business information

## Key Features Highlighted

- Multi-channel e-commerce integration (Shopify, WooCommerce, Amazon, eBay)
- Real-time inventory synchronization
- Automated order processing
- Multi-carrier shipping integration
- Enterprise-grade security and scalability
- 99.9% uptime and reliability

## Customization

The landing page is designed to be easily customizable:

- Update colors in `tailwind.config.js`
- Modify content in page components
- Add new sections by creating components
- Update SEO meta tags in each page

## Deployment

The site can be deployed on any hosting platform that supports Node.js or static sites:

- **Static Generation**: `npm run generate` for JAMstack hosting
- **SSR**: Deploy the `.output` folder after `npm run build`
- **Platforms**: Vercel, Netlify, Azure Static Web Apps, AWS S3, etc.

## License

This project is part of the DigiHub ChannelConnector & Logistics Management System.
