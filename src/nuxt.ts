import type { NuxtModule } from '@nuxt/schema'
import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  /** Inject Juxt's stylesheet (tokens + component styles). Defaults to true. */
  css?: boolean
}

const components = [
  'JAccordion',
  'JAccordionItem',
  'JAlert',
  'JAspectRatio',
  'JAvatar',
  'JAvatarGroup',
  'JBadge',
  'JBanner',
  'JBreadcrumb',
  'JBurger',
  'JButton',
  'JCard',
  'JCheckbox',
  'JCollapsible',
  'JCommandPalette',
  'JDialog',
  'JDropdownMenu',
  'JDropdownMenuItem',
  'JDropdownMenuLabel',
  'JDropdownMenuSeparator',
  'JDropdownMenuSub',
  'JEmptyState',
  'JFooter',
  'JFooterColumn',
  'JInput',
  'JKbd',
  'JNavbar',
  'JNavbarLink',
  'JPagination',
  'JPopover',
  'JProgress',
  'JRadio',
  'JRadioGroup',
  'JRating',
  'JSelect',
  'JSeparator',
  'JSheet',
  'JSidebar',
  'JSidebarGroup',
  'JSidebarItem',
  'JSkeleton',
  'JSlider',
  'JSpinner',
  'JStat',
  'JSwitch',
  'JTabs',
  'JTag',
  'JTextarea',
  'JTimeline',
  'JTimelineItem',
  'JToaster',
  'JToggleGroup',
  'JToggleGroupItem',
  'JTooltip',
  'JVisuallyHidden',
] as const

const composables = ['toast', 'useToast', 'useRecentCommands', 'useHotkey', 'formatHotkey'] as const

/**
 * Nuxt module: auto-imports every Juxt component and composable, and adds the
 * stylesheet.
 *
 *   export default defineNuxtConfig({ modules: ['@juxtui/ui/nuxt'] })
 */
const juxtModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@juxtui/ui',
    configKey: 'juxt',
    compatibility: { nuxt: '>=3.15.0' },
  },
  defaults: {
    css: true,
  },
  setup(options, nuxt) {
    for (const name of components) addComponent({ name, export: name, filePath: '@juxtui/ui' })
    // The editor lives in its own entry so apps without it never load Tiptap.
    addComponent({ name: 'JEditor', export: 'JEditor', filePath: '@juxtui/ui/editor' })
    addImports(composables.map(name => ({ name, from: '@juxtui/ui' })))
    if (options.css) nuxt.options.css.unshift('@juxtui/ui/style.css')
    nuxt.options.build.transpile.push('@juxtui/ui')
  },
})

export default juxtModule
