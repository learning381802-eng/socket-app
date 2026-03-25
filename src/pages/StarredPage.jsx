import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ExternalLink, Trash2, MessageSquare } from 'lucide-react'
import { useStore } from '../store'
import Avatar from '../components/ui/Avatar'

export default function StarredPage() {
  const { starredMessages, toggleStarMessage, setActiveView } = useStore()
  const [selectedStar, setSelectedStar] = useState(null)

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const handleStarClick = (msg) => {
    toggleStarMessage(msg)
    setSelectedStar(null)
  }

  const handleJumpToMessage = (msg) => {
    // In a real app, this would navigate to the conversation
    console.log('Jump to message:', msg.id)
    setActiveView('chat')
  }

  return (
    <div className="starred-page">
      {/* Header */}
      <div className="starred-header">
        <div className="starred-header-left">
          <button onClick={() => setActiveView('home')} className="starred-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="starred-icon-wrap">
            <Star size={24} />
          </div>
          <div>
            <h1 className="starred-title">Starred</h1>
            <p className="starred-subtitle">
              {starredMessages.length} saved message{starredMessages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Starred Messages List */}
      <div className="starred-list">
        {starredMessages.length === 0 ? (
          <div className="starred-empty">
            <div className="starred-empty-icon">
              <Star size={48} />
            </div>
            <h3>No starred messages</h3>
            <p>Star important messages to find them quickly later</p>
          </div>
        ) : (
          starredMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`starred-item ${selectedStar?.id === msg.id ? 'selected' : ''}`}
              onClick={() => setSelectedStar(msg)}
            >
              <Avatar name={msg.senderName} size={40} />
              <div className="starred-content">
                <div className="starred-header-row">
                  <span className="starred-sender">{msg.senderName}</span>
                  <span className="starred-conversation">{msg.conversationName}</span>
                  <span className="starred-time">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="starred-text">{msg.content}</p>
                <div className="starred-actions">
                  <button
                    className="starred-action-btn"
                    onClick={() => handleJumpToMessage(msg)}
                    data-tooltip="Jump to message"
                  >
                    <ExternalLink size={16} />
                    <span>Jump to message</span>
                  </button>
                  <button
                    className="starred-action-btn"
                    onClick={() => handleStarClick(msg)}
                    data-tooltip="Remove star"
                  >
                    <Star size={16} fill="currentColor" />
                    <span>Unstar</span>
                  </button>
                  <button
                    className="starred-action-btn delete"
                    data-tooltip="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="starred-star-indicator">
                <Star size={18} fill="var(--accent)" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
