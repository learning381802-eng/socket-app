export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'idle' | 'active'

export interface DiscoverUser {
  id: string
  displayName: string
  email?: string
  avatarUrl?: string
  bio?: string
  status?: PresenceStatus
}

export const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  active: '#22c55e',
  away: '#f59e0b',
  idle: '#f59e0b',
  busy: '#ef4444',
  offline: '#6b7280',
}
