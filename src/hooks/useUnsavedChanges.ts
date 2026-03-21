import { useEffect } from 'react'

/**
 * Warns the user before navigating away from a page with unsaved changes.
 * Uses beforeunload for browser-level navigation (tab close/refresh)
 * and popstate for back/forward button navigation.
 */
export function useUnsavedChanges(isDirty: boolean, message?: string) {
  const msg = message ?? 'You have unsaved changes. Are you sure you want to leave?'

  // Block browser-level navigation (tab close, refresh)
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = msg
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, msg])

  // Block back/forward browser navigation via popstate
  useEffect(() => {
    if (!isDirty) return

    const handlePopState = () => {
      if (!window.confirm(msg)) {
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href)
      }
    }

    // Push a state so we can detect when user presses back
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isDirty, msg])
}
