# juxt.ui

**Thoughtfully crafted, accessible components for Nuxt & Vue.**

[Documentation](https://juliuss3722.github.io/juxt-library/) · [Playground](https://juliuss3722.github.io/juxt-library/playground/)

Build with JuxtUI, customize every component in the browser, and copy the generated Vue snippet directly into your project.

**44 components. One token system. One motion language.**

```vue
<JButton>
  Save changes
</JButton>
```

## Why juxt.ui?

juxt.ui is a small, polished component library for **Nuxt and Vue 3**.

It focuses on the details that make an interface feel good: predictable focus behavior, subtle motion, accessible interactions, consistent tokens, and APIs that stay small.

* **Nuxt-first** — automatic components, composables and styles
* **Accessible by construction** — keyboard navigation, focus management and ARIA patterns
* **SSR-safe** — designed for Nuxt SSR
* **Light & dark themes** — built in
* **Reduced motion** — respects user preferences
* **Small APIs** — consistent props and `v-model` state
* **Token-based** — colors, spacing, typography, radius, motion and layering
* **Tailwind CSS v4 support** — JuxtUI tokens map to utilities
* **Tree-shakable** — import what you use
* **MIT licensed**

## Installation

```bash
pnpm add @juxtui/ui
```

### Nuxt

Add the JuxtUI module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@juxtui/ui/nuxt'],
})
```

Components, composables and styles are wired up automatically.

```vue
<JButton>
  Save changes
</JButton>
```

### Vue

Import the stylesheet once and import the components you use:

```ts
import '@juxtui/ui/style.css'

import { JButton, toast } from '@juxtui/ui'
```

## Playground

### Build it. Customize it. Copy the code.

The JuxtUI Playground lets you experiment with every component directly in the browser.

Change props, variants and content, see the result instantly, and copy the generated Vue snippet into your project.

**[Open the JuxtUI Playground →](https://juliuss3722.github.io/juxt-library/playground/)**

## Documentation

Explore every component, its API, keyboard interactions, accessibility behavior and examples in the full documentation.

**[Read the documentation →](https://juliuss3722.github.io/juxt-library/)**

## Tailwind CSS v4

Using Tailwind CSS v4?

Import the JuxtUI Tailwind entrypoint:

```css
@import '@juxtui/ui/tailwind.css';
```

JuxtUI maps its design tokens onto utilities such as:

```text
bg-surface
text-fg-muted
rounded-md
duration-fast
```

JuxtUI styles live in their own `juxt` cascade layer, so your application classes can override them naturally.

## Components

| Category       | Components                                                                           |
| -------------- | ------------------------------------------------------------------------------------ |
| **Actions**    | Button                                                                               |
| **Forms**      | Input · Textarea · Checkbox · Switch · Select                                        |
| **Overlays**   | Dialog · Dropdown Menu · Tooltip · Command Palette                                   |
| **Feedback**   | Toast · Badge                                                                        |
| **Display**    | Avatar · Card                                                                        |
| **Navigation** | Tabs                                                                                 |
| **Layout**     | Navbar · Burger · Footer · Sidebar                                                   |
| **Editor**     | Rich text editor with toolbar, selection menu, slash commands and Markdown shortcuts |

Every component is designed with:

* Light and dark themes
* Keyboard interaction
* Reduced-motion support
* SSR compatibility
* Accessible focus management

See the documentation for component-specific keyboard shortcuts, ARIA behavior and examples.

## Design philosophy

### Quiet until it matters

The interface is primarily grayscale. Green `#079D6B` is reserved for state: focus, checked, success and context.

Primary actions use ink rather than turning the entire interface green.

### Motion is feedback

JuxtUI uses four durations (80–240ms) and three motion curves.

Only `transform` and `opacity` are animated where possible. Entrances are slower than exits, and reduced-motion preferences are respected.

### Accessible by construction

Overlays trap focus, restore it when they close, and stack predictably.

When multiple layers are open, Escape and outside clicks affect only the top-most layer.

### Small APIs

Props describe what components do, and stateful components consistently use `v-model`.

If you know one JuxtUI component, the others should feel familiar.

### Tokens all the way down

Color, typography, spacing, radius, elevation, motion and layering are exposed as CSS custom properties.

Change a token such as `--juxt-accent` and the system follows.

## Editor

JuxtUI also includes a rich text editor with:

* Toolbar
* Selection menu
* Slash commands
* Markdown shortcuts
* Customizable extensions

Import it separately:

```ts
import { JuxtEditor } from '@juxtui/ui/editor'
```

## Browser support

JuxtUI is built for modern browsers and Vue 3 applications.

Components are designed to work with both client-side Vue applications and Nuxt SSR.

## Development

Clone the repository and install dependencies:

```bash
pnpm install
```

Run the documentation locally:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Build the package:

```bash
pnpm build
```

## Philosophy

juxt.ui intentionally favors **fewer, more polished components** over a large collection of loosely connected primitives.

Every component should feel like it belongs to the same system.

## License

MIT
