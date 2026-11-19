import { useData, withBase } from 'vitepress'
import { defineComponent, h } from 'vue'

import { data } from './site-facts.data.ts'

// One value from facts/ inline, by its dotted name; an unknown name stops the build, naming it and the page.
export const Fact = defineComponent({
  props: { name: { type: String, required: true } },
  setup(props) {
    const { page } = useData()

    return () => {
      const value = data.facts[props.name]
      if (value === undefined) {
        throw new Error(`${page.value.relativePath} asks for the fact ${props.name}, which facts/ does not hold`)
      }

      return h('span', String(value))
    }
  },
})

// A committed capture by its id in facts/captures.json, with its size, alt text and a caption under it; an unknown id
// stops the build, naming it and the page.
export const Shot = defineComponent({
  props: {
    id: { type: String, required: true },
    caption: { type: String, required: true },
  },
  setup(props) {
    const { page } = useData()

    return () => {
      const shot = data.shots[props.id]
      if (shot === undefined) {
        throw new Error(`${page.value.relativePath} shows the capture ${props.id}, which facts/captures.json does not list`)
      }

      return h('figure', { class: 'shot' }, [
        h('img', {
          class: 'shot__image',
          src: withBase(`/captures/${shot.file}`),
          alt: shot.alt,
          width: shot.width,
          height: shot.height,
          loading: 'lazy',
          decoding: 'async',
        }),
        h('figcaption', { class: 'shot__caption' }, props.caption),
      ])
    }
  },
})
