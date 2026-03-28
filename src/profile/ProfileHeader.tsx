// ProfileHeader.tsx - Modern redesign
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

interface Props {
  onEditProfile: () => void
}

const STATUS_COLORS = {
  online: '#22c55e',
  idle: '#f59e0b',
  offline: '#6b7280',
}

export default function ProfileHeader({ onEditProfile }: Props) {
  const { user } = useStore()
  const navigate = useNavigate()
  const [status] = useState<'online' | 'idle' | 'offline'>('online')

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const bio = user?.user_metadata?.bio
  const initial = displayName[0]?.toUpperCase()
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  const handleFindPeople = () => {
    navigate('/discover')
  }

  return (
    <div className="ph-root">
      <div className="ph-inner">
        {/* Header top row */}
        <div className="ph-top-row">
          {/* Avatar section */}
          <div className="ph-avatar-section">
            <div className="ph-avatar-wrap">
              <div className="ph-avatar">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt={displayName} className="ph-avatar-img" />
                ) : (
                  <span className="ph-avatar-initial">{initial}</span>
                )}
              </div>
              <span 
                className="ph-status-dot" 
                style={{ background: STATUS_COLORS[status], boxShadow: `0 0 0 3px var(--bg-primary), ${STATUS_COLORS[status]}40 0 0 8px` }} 
                title={status} 
              />
            </div>
            
            {/* Name and status */}
            <div className="ph-info">
              <h1 className="ph-name">{displayName}</h1>
              <div className="ph-status-row">
                <span className="ph-status-badge" style={{ color: STATUS_COLORS[status] }}>
                  <span className="ph-status-dot-small" style={{ background: STATUS_COLORS[status] }} />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="ph-joined">Joined {joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <div className="ph-actions">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="ph-btn ph-btn-icon"
              onClick={onEditProfile}
              title="Edit Profile"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span className="ph-btn-text">Edit Profile</span>
            </motion.button>
          </div>
        </div>

        {/* Bio section */}
        {bio && (
          <div className="ph-bio-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ph-bio-icon">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p className="ph-bio-text">{bio}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="ph-action-row">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="ph-btn ph-btn-primary"
            onClick={() => navigate('/')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            Start Practice
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="ph-btn ph-btn-secondary"
            onClick={handleFindPeople}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Find People
          </motion.button>

          <span className="ph-btn ph-btn-ghost" style={{ pointerEvents: 'none', opacity: 0.8 }}>
            Hidden chat is only unlocked from the “everyone” trigger on homepage.
          </span>
        </div>
      </div>
    </div>
  )
}
