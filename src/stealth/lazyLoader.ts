// lazyLoader.ts
// Lazy loads the chat bundle only after stealth trigger is activated
// Chat code is never included in the initial page bundle

import { lazy } from 'react'

// Obfuscated import path - loaded only on demand
export const ModuleCore = lazy(() =>
  import('../pages/ChatLayout').then((m) => ({ default: m.default }))
)

export const StreamAuth = lazy(() =>
  import('../pages/AuthPage').then((m) => ({ default: m.default }))
)
