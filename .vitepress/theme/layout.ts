import { useData, withBase } from 'vitepress'
import DefaultTheme, { VPNavBarSearch } from 'vitepress/theme-without-fonts'
import { defineComponent, h } from 'vue'

const MASCOT_SIZE = 28

// The default layout with the sidebar as the site's only chrome, as the Misha window's rail is: the wordmark with the
// mascot at its top and the search field under it. The top bar is off on every page (navbar: false in config.mts), so
// this search field is the only one mounted and its keyboard shortcut opens one search box.
export const Layout = defineComponent({
  setup() {
    const { site, theme } = useData()

    return () => {
      const { logo, logoLink } = theme.value
      if (typeof logo !== 'object' || !('src' in logo) || typeof logoLink !== 'string') {
        throw new Error('The sidebar brand needs themeConfig.logo as { src, alt } and themeConfig.logoLink as a path')
      }

      return h(DefaultTheme.Layout, null, {
        'sidebar-nav-before': () =>
          h('div', { class: 'dm-rail-head' }, [
            h('a', { class: 'dm-brand', href: withBase(logoLink) }, [
              h('img', {
                class: 'dm-brand__mascot',
                src: withBase(logo.src),
                alt: logo.alt ?? '',
                width: MASCOT_SIZE,
                height: MASCOT_SIZE,
              }),
              h('span', site.value.title),
            ]),
            h(VPNavBarSearch, { class: 'dm-rail-search' }),
          ]),
      })
    }
  },
})
