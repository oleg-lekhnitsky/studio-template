# Nuxt + Sanity portfolio

A minimal portfolio with a Nuxt 4 frontend and Sanity Studio content management.

## Setup

1. Copy `.env.example` to `.env` and add your Sanity, Telegram, site URL, and optional Upstash settings.
2. Run `npm install`.
3. Run `npm run dev` for the portfolio.
4. Run `npm run studio` for Sanity Studio.

In Sanity, create `Case` documents and compose each page with image, video, and text blocks. Mark cases as featured to show them on the home page. Contact submissions are delivered through the server-side Telegram Bot API integration; never expose the bot token in public runtime configuration.

## Production

- Set `NUXT_PUBLIC_SITE_URL` to the canonical public origin.
- Set `SANITY_API_READ_TOKEN` to enable draft preview and Visual Editing.
- Set `SANITY_STUDIO_PREVIEW_URL` on the Studio deployment to the protected preview frontend. The Studio's Presentation tool will then offer direct links to each draft case and vacancy.
- Configure a Sanity webhook to `POST /api/revalidate` with the `x-sanity-secret` header.
- Configure Upstash REST credentials for rate limiting that survives server restarts and serverless instances.
- Deploy Studio separately with `npm run studio:deploy`.
