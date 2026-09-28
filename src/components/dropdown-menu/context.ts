import type { InjectionKey, Ref } from 'vue'

export interface MenuRootContext {
  /** Close the whole menu tree. */
  close: (restoreFocus?: boolean) => void
}

export interface MenuLevelContext {
  content: Ref<HTMLElement | null>
  /** Id of the submenu currently open at this level. */
  openSub: Ref<string | null>
  setOpenSub: (id: string | null) => void
  /** Close the open submenu shortly, unless the pointer is on its way into it. */
  scheduleSubClose: () => void
  cancelSubClose: () => void
}

export const MENU_ROOT: InjectionKey<MenuRootContext> = Symbol('JDropdownMenu')
export const MENU_LEVEL: InjectionKey<MenuLevelContext> = Symbol('JDropdownMenuLevel')

export function getMenuItems(content: HTMLElement | null): HTMLElement[] {
  if (!content) return []
  return Array.from(content.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])'))
}
