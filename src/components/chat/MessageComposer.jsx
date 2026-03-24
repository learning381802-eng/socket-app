import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Paperclip, Smile, Send, X, Bold, Italic, Code } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useStore } from '../../store'
import { sendMessage, uploadFile, supabase } from '../../lib/supabase'

export default function MessageComposer({ conversationId }) {
  const { user, addOptimisticMessage, confirmMessage, addNotification, setTypingUser } = useStore()
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeout = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [content])

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!conversationId || !user) return
    const channel = supabase.channel(`typing:${conversationId}`)
    channel.send({ type: 'broadcast', event: 'typing', payload: { user_id: user.id } })

    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      setTypingUser(conversationId, user.id, false)
    }, 2000)
  }, [conversationId, user])

  const handleChange = (e) => {
    setContent(e.target.value)
    handleTyping()
  }

  const handleSend = async () => {
    const text = content.trim()
    if (!text && attachments.length === 0) return
    if (!conversationId || !user) return

    const tempId = 'temp-' + Date.now()
    const optimisticMsg = {
      id: tempId,
      tempId: tempId,
      content: text,
      attachments,
      sender_id: user.id,
      users: { display_name: user.user_metadata?.display_name || 'You' },
      created_at: new Date().toISOString(),
      pending: true,
    }

    addOptimisticMessage(optimisticMsg)
    setContent('')
    setAttachments([])
    setShowEmoji(false)
    setTypingUser(conversationId, user.id, false)

    try {
      const { data, error } = await sendMessage(conversationId, user.id, text, attachments)
      if (error) throw error
      confirmMessage(tempId, data)
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to send message' })
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const newAttachments = []
      for (const file of files) {
        const path = `${conversationId}/${Date.now()}-${file.name}`
        const { url } = await uploadFile(file, path)
        if (url) {
          newAttachments.push({
            name: file.name,
            url,
            type: file.type,
            size: file.size,
          })
        }
      }
      setAttachments((prev) => [...prev, ...newAttachments])
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to upload file' })
    } finally {
      setUploading(false)
    }
  }

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.getUnified ? emoji.getUnified() : emoji.native)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const canSend = content.trim().length > 0 || attachments.length > 0

  return (
    <div className="compose-area">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              {att.type?.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="w-12 h-12 object-cover rounded-lg" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  📄
                </div>
              )}
              <span className="text-xs font-medium truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>
                {att.name}
              </span>
              <button
                onClick={() => removeAttachment(i)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="compose-input-wrapper">
        {/* Format toggle */}
        <button
          className="p-2 rounded-full hover:bg-var(--bg-tertiary) transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Formatting"
        >
          <Bold size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type a message"
          className="compose-input"
          rows={1}
        />

        {/* Actions */}
        <div className="compose-actions">
          {/* Emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-full hover:bg-var(--bg-tertiary) transition-colors"
              style={{ color: showEmoji ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <Smile size={20} />
            </button>
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className="rounded-2xl shadow-lg overflow-hidden"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                  >
                    <EmojiPicker 
                      onEmojiClick={handleEmojiSelect}
                      theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                      skinTonesDisabled
                      searchDisabled
                      width={320}
                      height={400}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Attachment upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-full hover:bg-var(--bg-tertiary) transition-colors"
            style={{ color: uploading ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {uploading ? (
              <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <Paperclip size={20} />
            )}
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="compose-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
