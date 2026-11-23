import { type Theme } from 'vitepress'
// The theme without its bundled Inter font: the site serves its own brand fonts.
import DefaultTheme from 'vitepress/theme-without-fonts'

import { Layout } from './layout.ts'
import './fonts.css'
import './tokens.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
} satisfies Theme
