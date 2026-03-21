// stealthRouteGuard.tsx
// Protects /socket from direct URL access without trigger activation

import { Navigate } from 'react-router-dom'
import { sessionGate } from './sessionGate'

interface Props {
  children: React.ReactNode
}

export default function StealthRouteGuard({ children }: Props) {
  if (!sessionGate.isAuthorized()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
