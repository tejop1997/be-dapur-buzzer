// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  future: { compatibilityVersion: 4 },
  ssr: true,
  pages: false,
  components: false,
  nitro: {
    preset: "vercel",
    serveStatic: false,
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "access-control-allow-headers":
            "Authorization, Content-Type, X-Requested-With",
        },
      },
      "/**": { prerender: false },
    },
    prerender: { routes: [] },
  },
  runtimeConfig: {
    // @ts-ignore
    MONGODB_URI: process.env.MONGODB_URI,
    // @ts-ignore
    MONGODB_DB: process.env.MONGODB_DB,
    // @ts-ignore
    JWT_SECRET: process.env.JWT_SECRET,
  },
});
