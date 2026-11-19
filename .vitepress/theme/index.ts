import { type Theme } from 'vitepress'
// The theme without its bundled Inter font: the site serves its own brand fonts.
import DefaultTheme from 'vitepress/theme-without-fonts'

import { Fact, Shot } from './components.ts'
import './fonts.css'
import './tokens.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Fact', Fact)
    app.component('Shot', Shot)
  },
} satisfies Theme
