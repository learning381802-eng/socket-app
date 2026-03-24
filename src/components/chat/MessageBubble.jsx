import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Smile, MoreVertical, Check, CheckCheck } from 'lucide-react'
import Avatar from '../ui/Avatar'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

export default function MessageBubble({ message, isOwn, showHeader, isLast, consecutive }) {
  const [showActions, setShowActions] = useState(false)
  const [reactions] = useState(message.reactions || {})

  const senderName = message.users?.display_name || 'Unknown'
  const timeStr = format(new Date(message.created_at), 'h:mm a')
  const isPending = message.pending

  const hasAttachments = message.attachments?.length > 0
  const contentText = typeof message.content === 'string' ? message.content : JSON.stringify(message.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`message-group ${consecutive ? 'mt-1' : 'mt-3'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar - only show if not consecutive or first in group */}
      {!consecutive && (
        <div className="message-avatar-container">
          <Avatar name={senderName} size={36} src={message.users?.avatar_url} />
        </div>
      )}
      {!consecutive && <div style={{ width: 36, flexShrink: 0 }} />}

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Sender name and timestamp */}
        {!consecutive && showHeader && (
          <div className="flex items-center gap-2 mb-1">
            <span className="message-sender-name">{senderName}</span>
            <span className="message-timestamp">{timeStr}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`message-bubble ${isOwn ? 'message-bubble-sent' : 'message-bubble-received'}`}
          style={{
            borderRadius: isLast 
              ? (isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px')
              : '18px'
          }}
        >
          {/* Text content */}
          <div
            className="message-text"
            style={isOwn ? { color: 'var(--message-own-text)' } : {}}
            dangerouslySetInnerHTML={{ __html: formatMessage(contentText) }}
          />

          {/* Attachments */}
          {hasAttachments && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((att, i) => (
                <Attachment key={i} attachment={att} isOwn={isOwn} />
              ))}
            </div>
          )}

          {/* Reactions */}
          {Object.keys(reactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  className="reaction-btn"
                  style={{
                    background: users.includes('me') ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                    border: users.includes('me') ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: users.includes('me') ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {emoji} {users.length}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message actions (hover) */}
        {showActions && (
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeStr}</span>
              {isOwn && (
                <>
                  <Check size={12} style={{ color: 'var(--text-muted)' }} />
                  <CheckCheck size={12} style={{ color: 'var(--accent)' }} />
                </>
              )}
            </div>
            <button
              className="p-1 rounded hover:bg-var(--bg-tertiary)"
              style={{ color: 'var(--text-muted)' }}
            >
              <Smile size={14} />
            </button>
            <button
              className="p-1 rounded hover:bg-var(--bg-tertiary)"
              style={{ color: 'var(--text-muted)' }}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Attachment({ attachment, isOwn }) {
  const isImage = attachment.type?.startsWith('image/')
  
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm no-underline transition-colors ${
        isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-var(--bg-tertiary) hover:bg-var(--border)'
      }`}
      style={isOwn ? { color: 'white' } : { color: 'var(--text-primary)' }}
    >
      {isImage ? (
        <img 
          src={attachment.url} 
          alt={attachment.name} 
          className="w-16 h-16 object-cover rounded-lg"
        />
      ) : (
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
        >
          📄
        </div>
      )}
      <span className="truncate max-w-[150px]">{attachment.name}</span>
    </a>
  )
}

// Simple message formatter (supports basic markdown)
function formatMessage(text) {
  if (!text) return ''
  
  let formatted = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Links
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br/>')
  
  return formatted
}
