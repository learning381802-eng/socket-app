// ProfileHeader.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { sessionGate } from '../stealth/sessionGate'
import { useNavigate } from 'react-router-dom'

interface Props {
  onEditProfile: () => void
}

const STATUS_COLORS = {
  online: '#1e8e3e',
  idle: '#f9ab00',
  offline: '#80868b',
}

export default function ProfileHeader({ onEditProfile }: Props) {
  const { user } = useStore()
  const navigate = useNavigate()
  const [status] = useState<'online' | 'idle' | 'offline'>('online')

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const initial = displayName[0]?.toUpperCase()
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  const handleOpenChat = () => {
    sessionGate.authorize()
    navigate('/socket')
  }

  return (
    <div className="ph-root">
      <div className="ph-inner">
        {/* Avatar */}
        <div className="ph-avatar-wrap">
          <div className="ph-avatar">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt={displayName} className="ph-avatar-img" />
            ) : (
              <span className="ph-avatar-initial">{initial}</span>
            )}
          </div>
          <span className="ph-status-dot" style={{ background: STATUS_COLORS[status] }} title={status} />
        </div>

        {/* Info */}
        <div className="ph-info">
          <div className="ph-name-row">
            <h1 className="ph-name">{displayName}</h1>
          </div>
          <p className="ph-handle">{email}</p>
          <p className="ph-last-active">
            <span className="ph-status-text" style={{ color: STATUS_COLORS[status] }}>● {status}</span>
            <span className="ph-dot-sep">·</span>
            Joined {joinedDate}
          </p>
        </div>

        {/* Actions */}
        <div className="ph-actions">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="ph-btn ph-btn-primary"
            onClick={() => navigate('/')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            Start Practice
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="ph-btn ph-btn-ghost"
            onClick={onEditProfile}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </motion.button>

          {/* Hidden chat button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="ph-btn ph-btn-icon"
            onClick={handleOpenChat}
            title="Message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
