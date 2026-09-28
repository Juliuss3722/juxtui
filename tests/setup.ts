import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'
import { toast } from '../src/composables/useToast'

// Vitest runs afterEach hooks in reverse order of registration: components
// unmount first (taking their teleported nodes with them), then the page is reset.
afterEach(() => {
  toast.dismiss()
  document.body.innerHTML = ''
})

enableAutoUnmount(afterEach)
