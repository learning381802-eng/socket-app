// stealthRouter.ts
// Route definitions and path constants for the stealth system

export const ROUTES = {
  home: '/',
  hidden: '/socket',
  hiddenNested: '/socket/*',
} as const

export const isHiddenRoute = (pathname: string) =>
  pathname.startsWith(ROUTES.hidden)
