import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Smile, Send, Paperclip } from 'lucide-react'
import { useStore } from '../../store'
import { sendMessage } from '../../lib/supabase'
import Avatar from '../ui/Avatar'
import EmojiPicker from 'emoji-picker-react'

export default function ThreadPanel() {
  const {
    user, activeConversation, rightPanelTab, setRightPanelOpen,
    addNotification, members,
  } = useStore()

  const [threadMessages, setThreadMessages] = useState([])
  const [replyContent, setReplyContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [parentMessage, setParentMessage] = useState(null)
  const textareaRef = useRef(null)

  // For demo purposes - in real implementation, you'd fetch thread messages
  useEffect(() => {
    // Load thread messages for the active conversation
    // This is a placeholder - implement based on your data structure
  }, [activeConversation])

  const handleSendReply = async () => {
    if (!replyContent.trim() || !activeConversation || !parentMessage) return

    try {
      await sendMessage(
        activeConversation.id,
        user.id,
        replyContent,
        [],
        parentMessage.id // thread_id
      )
      setReplyContent('')
      // Reload thread messages
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to send reply' })
    }
  }

  const handleEmojiSelect = (emoji) => {
    setReplyContent((prev) => prev + (emoji.native || ''))
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  const closePanel = () => {
    setRightPanelOpen(false)
    setParentMessage(null)
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'You'

  return (
    <motion.div
      className="thread-panel"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Thread Header */}
      <div className="thread-header">
        <div className="thread-header-left">
          <button
            onClick={closePanel}
            className="thread-close-btn"
            data-tooltip="Close thread"
          >
            <X size={20} />
          </button>
          <div className="thread-context">
            <MessageSquare size={18} className="thread-icon" />
            <span className="thread-title">Thread</span>
          </div>
        </div>
      </div>

      {/* Parent Message Context */}
      {parentMessage && (
        <div className="thread-parent-message">
          <div className="thread-parent-header">
            <span className="thread-parent-label">Replying to</span>
          </div>
          <div className="thread-parent-content">
            <Avatar name={displayName} size={24} />
            <div className="thread-parent-text">
              {parentMessage.content}
            </div>
          </div>
        </div>
      )}

      {/* Thread Messages */}
      <div className="thread-messages">
        {threadMessages.length === 0 ? (
          <div className="thread-empty">
            <MessageSquare size={48} className="thread-empty-icon" />
            <p className="thread-empty-title">No replies yet</p>
            <p className="thread-empty-text">
              Start the conversation by replying below
            </p>
          </div>
        ) : (
          threadMessages.map((msg) => (
            <div key={msg.id} className="thread-message">
              <Avatar name={msg.users?.display_name || 'User'} size={32} />
              <div className="thread-message-content">
                <div className="thread-message-header">
                  <span className="thread-message-author">
                    {msg.users?.display_name || 'Unknown'}
                  </span>
                  <span className="thread-message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="thread-message-text">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thread Reply Composer */}
      <div className="thread-composer">
        <div className="thread-composer-input">
          <Avatar name={displayName} size={32} />
          <div className="thread-input-wrapper">
            <textarea
              ref={textareaRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendReply()
                }
              }}
              placeholder="Reply in thread"
              className="thread-textarea"
              rows={1}
            />
            <div className="thread-composer-actions">
              <div className="relative">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="thread-composer-btn"
                  data-tooltip="Emoji"
                >
                  <Smile size={18} />
                </button>
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="thread-emoji-picker"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                        width={280}
                        height={320}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className="thread-composer-btn" data-tooltip="Attach file">
                <Paperclip size={18} />
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
                className={`thread-send-btn ${replyContent.trim() ? 'active' : ''}`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
