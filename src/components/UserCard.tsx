// UserCard.tsx - User card for discover page
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DiscoverUser, STATUS_COLORS } from '../data/users'

interface Props {
  user: DiscoverUser
}

export default function UserCard({ user }: Props) {
  const navigate = useNavigate()
  const initial = user.displayName?.[0]?.toUpperCase() || '?'
  const status = user.status || 'offline'

  const handleMessage = () => {
    // Navigate to chat with this user
    navigate(`/socket?userId=${user.id}`)
  }

  return (
    <motion.div
      className="uc-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.15 }}
    >
      <div className="uc-header">
        <div className="uc-avatar-wrap">
          <div className="uc-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="uc-avatar-img" />
            ) : (
              <span className="uc-avatar-initial">{initial}</span>
            )}
          </div>
          <span
            className="uc-status-dot"
            style={{
              background: STATUS_COLORS[status] || STATUS_COLORS.offline,
              boxShadow: `0 0 0 2px var(--bg-primary), ${(STATUS_COLORS[status] || STATUS_COLORS.offline)}40 0 0 6px`,
            }}
            title={status}
          />
        </div>
        <span
          className="uc-status-badge"
          style={{
            background: `${(STATUS_COLORS[status] || STATUS_COLORS.offline)}15`,
            color: STATUS_COLORS[status] || STATUS_COLORS.offline,
          }}
        >
          {status}
        </span>
      </div>

      <div className="uc-body">
        <h3 className="uc-name">{user.displayName}</h3>
        {user.bio && (
          <p className="uc-bio">{user.bio}</p>
        )}
      </div>

      <div className="uc-footer">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="uc-message-btn"
          onClick={handleMessage}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Message
        </motion.button>
      </div>
    </motion.div>
  )
}
