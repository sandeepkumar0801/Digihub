import { defineNuxtPlugin } from 'nuxt/app'
import { useRouter, type RouteLocationNormalized } from 'vue-router'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach((to: RouteLocationNormalized) => {
    if (window.gtag) {
      window.gtag('config', 'G-HFXNZJWGN7', {
        page_path: to.fullPath
      })
    }
  })
})
