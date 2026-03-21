// sessionGate.ts
// Manages stealth access authorization via sessionStorage

const GATE_KEY = '__m_authorized__'

export const sessionGate = {
  authorize: () => {
    sessionStorage.setItem(GATE_KEY, btoa('1'))
  },
  isAuthorized: () => {
    try {
      return atob(sessionStorage.getItem(GATE_KEY) || '') === '1'
    } catch {
      return false
    }
  },
  revoke: () => {
    sessionStorage.removeItem(GATE_KEY)
  },
}
