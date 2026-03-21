import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Smile, Reply, MoreHorizontal, Check, CheckCheck, Paperclip, Image as ImageIcon, File } from 'lucide-react'
import Avatar from '../ui/Avatar'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

export default function MessageBubble({ message, isOwn, showHeader, isLast }) {
  const [showActions, setShowActions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [reactions, setReactions] = useState(message.reactions || {})

  const senderName = message.users?.display_name || 'Unknown'
  const timeStr = format(new Date(message.created_at), 'h:mm a')
  const isPending = message.pending

  const toggleReaction = (emoji) => {
    setReactions((prev) => {
      const updated = { ...prev }
      if (updated[emoji]?.includes('me')) {
        updated[emoji] = updated[emoji].filter((u) => u !== 'me')
        if (!updated[emoji].length) delete updated[emoji]
      } else {
        updated[emoji] = [...(updated[emoji] || []), 'me']
      }
      return updated
    })
    setShowEmojiPicker(false)
  }

  const hasAttachments = message.attachments?.length > 0
  const contentText = typeof message.content === 'string' ? message.content : JSON.stringify(message.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-end gap-2.5 mb-0.5 px-2 py-0.5 rounded-2xl transition-colors relative ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false) }}
      style={{ background: showActions ? 'var(--message-hover)' : 'transparent' }}
    >
      {/* Avatar */}
      <div className={`shrink-0 mb-0.5 ${showHeader ? 'visible' : 'invisible'}`}>
        <Avatar name={senderName} size={32} src={message.users?.avatar_url} />
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Header */}
        {showHeader && (
          <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isOwn ? 'You' : senderName}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{timeStr}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative"
          style={isOwn ? {
            background: 'var(--accent)',
            color: 'white',
            borderBottomRightRadius: isLast ? 6 : undefined,
          } : {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderBottomLeftRadius: isLast ? 6 : undefined,
          }}
        >
          {/* Text content */}
          <div
            className="message-content"
            dangerouslySetInnerHTML={{ __html: formatMessage(contentText) }}
          />

          {/* Attachments */}
          {hasAttachments && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((att, i) => (
                <AttachmentPreview key={i} attachment={att} isOwn={isOwn} />
              ))}
            </div>
          )}

          {/* Pending indicator */}
          {isPending && (
            <span className="absolute -bottom-4 right-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Sending...
            </span>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`reaction-btn ${users.includes('me') ? 'active' : ''}`}
              >
                {emoji} {users.length}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }}
            className={`absolute top-0 flex items-center gap-0.5 p-1 rounded-xl shadow-message z-10 ${isOwn ? 'left-2' : 'right-2'}`}
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            <div className="relative">
              <ActionBtn
                icon={<Smile size={13} />}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                tooltip="React"
              />
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute bottom-full mb-2 flex items-center gap-1 p-1.5 rounded-2xl shadow-panel"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      left: isOwn ? undefined : 0,
                      right: isOwn ? 0 : undefined,
                    }}
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(emoji)}
                        className="text-lg hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ActionBtn icon={<Reply size={13} />} tooltip="Reply" />
            <ActionBtn icon={<MoreHorizontal size={13} />} tooltip="More" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActionBtn({ icon, onClick, tooltip }) {
  return (
    <button
      onClick={onClick}
      data-tooltip={tooltip}
      className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      style={{ color: 'var(--text-secondary)' }}
    >
      {icon}
    </button>
  )
}

function AttachmentPreview({ attachment, isOwn }) {
  const isImage = attachment.type?.startsWith('image/')
  const textStyle = isOwn ? { color: 'rgba(255,255,255,0.85)' } : { color: 'var(--text-secondary)' }
  const bgStyle = isOwn ? { background: 'rgba(0,0,0,0.15)' } : { background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }

  if (isImage && attachment.url) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="rounded-xl max-w-xs max-h-48 object-cover"
          style={{ border: isOwn ? 'none' : '1px solid var(--border)' }}
        />
      </a>
    )
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl no-underline transition-opacity hover:opacity-80"
      style={bgStyle}
    >
      <File size={14} style={textStyle} />
      <span className="text-xs font-medium truncate max-w-[160px]" style={textStyle}>
        {attachment.name || 'Attachment'}
      </span>
    </a>
  )
}

function formatMessage(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/@(\w+)/g, '<span style="color:var(--accent);font-weight:600">@$1</span>')
}
