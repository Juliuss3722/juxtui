import type { Component, Plugin } from 'vue'
import * as components from './components'

/**
 * Registers every Juxt component globally.
 *
 *   app.use(JuxtUI)
 *
 * Prefer direct imports (or the Nuxt module) if you want tree-shaking.
 */
export const JuxtUI: Plugin = {
  install(app) {
    for (const [name, component] of Object.entries(components)) app.component(name, component as Component)
  },
}
