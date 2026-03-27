import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AtSign, Check, CheckCheck, ExternalLink, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import Avatar from '../components/ui/Avatar'

export default function MentionsPage() {
  const navigate = useNavigate()
  const { mentions, markMentionRead, markAllMentionsRead, setActiveView, conversations, setActiveConversation } = useStore()
  const [selectedMention, setSelectedMention] = useState(null)

  const unreadCount = mentions.filter((m) => !m.read).length

  const handleMentionClick = (mention) => {
    markMentionRead(mention.id)
    setSelectedMention(mention)
  }

  const openMentionConversation = (mention) => {
    const conv = conversations.find((c) => c.id === mention.conversationId)
    if (!conv) return
    setActiveConversation(conv)
    const prefix = conv.type === 'space' ? 'space' : conv.type === 'group' ? 'group' : 'dm'
    navigate(`/socket/${prefix}/${conv.id}`)
  }

  const handleDeleteMention = (e, id) => {
    e.stopPropagation()
    // In a real app, this would remove the mention
    console.log('Delete mention:', id)
  }

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="mentions-page">
      {/* Header */}
      <div className="mentions-header">
        <div className="mentions-header-left">
          <button onClick={() => { setActiveView('home'); navigate('/socket') }} className="mentions-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="mentions-icon-wrap">
            <AtSign size={24} />
          </div>
          <div>
            <h1 className="mentions-title">Mentions</h1>
            <p className="mentions-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread mention${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllMentionsRead} className="mentions-mark-read-btn">
            <CheckCheck size={18} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Mentions List */}
      <div className="mentions-list">
        {mentions.length === 0 ? (
          <div className="mentions-empty">
            <div className="mentions-empty-icon">
              <AtSign size={48} />
            </div>
            <h3>No mentions yet</h3>
            <p>When someone mentions you with @yourname, it will appear here</p>
          </div>
        ) : (
          mentions.map((mention) => (
            <motion.div
              key={mention.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mention-item ${mention.read ? 'read' : 'unread'} ${selectedMention?.id === mention.id ? 'selected' : ''}`}
              onClick={() => handleMentionClick(mention)}
            >
              <Avatar name={mention.senderName} size={40} />
              <div className="mention-content">
                <div className="mention-header">
                  <span className="mention-sender">{mention.senderName}</span>
                  <span className="mention-conversation">{mention.conversationName}</span>
                  <span className="mention-time">{formatTime(mention.timestamp)}</span>
                </div>
                <p className="mention-text">{mention.content}</p>
                <div className="mention-actions">
                  <button
                    className="mention-action-btn"
                    data-tooltip="Jump to message"
                    onClick={(e) => { e.stopPropagation(); openMentionConversation(mention) }}
                  >
                    <ExternalLink size={16} />
                    <span>Jump to message</span>
                  </button>
                  <button
                    className="mention-action-btn delete"
                    onClick={(e) => handleDeleteMention(e, mention.id)}
                    data-tooltip="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {!mention.read && <div className="mention-unread-dot" />}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
