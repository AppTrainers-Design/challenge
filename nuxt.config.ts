// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from 'node:fs'

// Every page under pages/challenge, e.g. "admin/index.vue" → "/challenge/admin".
// The pages render a skeleton on the server (the demo state lives in the
// visitor's localStorage), so the prerenderer finds no links to crawl and each
// route has to be listed.
const challengeRoutes = readdirSync('pages/challenge', { recursive: true, encoding: 'utf8' })
  .filter(file => file.endsWith('.vue') && !file.includes('['))
  .map(file => `/challenge/${file.replace(/\.vue$/, '').replace(/(^|\/)index$/, '')}`.replace(/\/$/, ''))
const prerenderRoutes = ['/', '/ar', ...challengeRoutes, ...challengeRoutes.map(route => `/ar${route}`)]

// GitHub Pages serves the site under /challenge/ (NUXT_APP_BASE_URL). Nitro adds
// the base to a prerender route only when the route doesn't already start with
// it, and "/challenge/admin" does, so it would render "/admin" instead. Adding
// the base here keeps every route unambiguous. Crawled links and _payload.json
// routes go through the same check, so both are turned off below.
const base = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  app: {
    head: {
      title: 'Game Challenge - Gaming Lab',
      // Same fonts and weights as gaming-lab-fe.
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: 'assets/css/tailwind.css',
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    // host/*.json holds the few gaming-lab-fe keys that the borrowed
    // ExamQuestion and VideoPlayer components need.
    locales: [
      { code: 'en', language: 'en-US', name: 'English', dir: 'ltr', files: ['en.json', 'host/en.json'] },
      { code: 'ar', language: 'ar-JO', name: 'العربية', dir: 'rtl', files: ['ar.json', 'host/ar.json'] },
    ],
    // The language lives in the URL alone: a static host cannot redirect on a cookie.
    detectBrowserLanguage: false,
  },
  experimental: {
    // Keep each page's payload inline. The pages carry only the skeleton state
    // on the server, so a separate _payload.json saves nothing.
    payloadExtraction: false,
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: prerenderRoutes.map(route => base + route),
    },
  },
})
