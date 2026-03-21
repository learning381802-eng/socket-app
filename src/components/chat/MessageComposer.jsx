import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Paperclip, Smile, Send, X, Bold, Italic, Code, AtSign } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useStore } from '../../store'
import { sendMessage, uploadFile, supabase } from '../../lib/supabase'

export default function MessageComposer({ conversationId }) {
  const { user, addOptimisticMessage, confirmMessage, addNotification, setTypingUser } = useStore()
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [showFormatBar, setShowFormatBar] = useState(false)
  const [mentions, setMentions] = useState([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionUsers, setMentionUsers] = useState([])
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeout = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }, [content])

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!conversationId || !user) return
    // Broadcast typing via Supabase realtime channel
    const channel = supabase.channel(`typing:${conversationId}`)
    channel.send({ type: 'broadcast', event: 'typing', payload: { user_id: user.id } })

    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      setTypingUser(conversationId, user.id, false)
    }, 2000)
  }, [conversationId, user])

  const handleChange = (e) => {
    const val = e.target.value
    setContent(val)
    handleTyping()

    // Check for @ mention
    const lastAt = val.lastIndexOf('@')
    if (lastAt !== -1 && lastAt === val.length - 1) {
      setShowMentions(true)
      setMentionQuery('')
    } else if (lastAt !== -1) {
      const query = val.slice(lastAt + 1)
      if (!query.includes(' ')) {
        setMentionQuery(query)
        setShowMentions(true)
        searchMentionUsers(query)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const searchMentionUsers = async (q) => {
    const { data } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${q}%`)
      .limit(6)
    setMentionUsers(data || [])
  }

  const insertMention = (u) => {
    const lastAt = content.lastIndexOf('@')
    setContent(content.slice(0, lastAt) + `@${u.display_name} `)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setShowEmoji(false)
      setShowMentions(false)
    }
  }

  const handleSend = async () => {
    const text = content.trim()
    if (!text && attachments.length === 0) return
    if (!conversationId || !user) return

    const tempId = 'temp-' + Date.now()
    const now = new Date().toISOString()

    // Optimistic update
    addOptimisticMessage({
      id: tempId,
      tempId,
      conversation_id: conversationId,
      sender_id: user.id,
      content: text,
      attachments,
      created_at: now,
      users: {
        id: user.id,
        display_name: user.user_metadata?.display_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
      },
    })

    setContent('')
    setAttachments([])

    const { data, error } = await sendMessage(conversationId, user.id, text, attachments)
    if (error) {
      addNotification({ type: 'error', message: 'Failed to send message' })
    } else if (data) {
      confirmMessage(tempId, data)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const path = `${user.id}/${Date.now()}-${file.name}`
          const { url, error } = await uploadFile(file, path)
          if (error) throw error
          return { name: file.name, url, type: file.type, size: file.size }
        })
      )
      setAttachments((prev) => [...prev, ...uploads])
    } catch {
      addNotification({ type: 'error', message: 'File upload failed' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const insertFormat = (wrap) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end) || 'text'
    const newContent = content.slice(0, start) + wrap + selected + wrap + content.slice(end)
    setContent(newContent)
    ta.focus()
  }

  const canSend = content.trim().length > 0 || attachments.length > 0

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      {/* Formatting bar */}
      <AnimatePresence>
        {showFormatBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-1"
          >
            <div className="flex items-center gap-1 px-1 py-1">
              <FormatBtn icon={<Bold size={13} />} onClick={() => insertFormat('**')} tooltip="Bold" />
              <FormatBtn icon={<Italic size={13} />} onClick={() => insertFormat('*')} tooltip="Italic" />
              <FormatBtn icon={<Code size={13} />} onClick={() => insertFormat('`')} tooltip="Code" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 flex-wrap mb-2 overflow-hidden"
          >
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <span className="truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>
                  {att.name}
                </span>
                <button onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                  style={{ color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main composer */}
      <div
        className="flex flex-col rounded-2xl relative"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)' }}
      >
        {/* Mention suggestions */}
        <AnimatePresence>
          {showMentions && mentionUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full mb-2 left-0 right-0 rounded-2xl shadow-panel overflow-hidden"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              {mentionUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => insertMention(u)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--accent)' }}>
                    {u.display_name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>{u.display_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message... (Shift+Enter for new line, @mention)"
          rows={1}
          className="flex-1 bg-transparent px-4 pt-3 pb-2 text-sm outline-none resize-none leading-relaxed"
          style={{ color: 'var(--text-primary)', minHeight: 44, maxHeight: 180 }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center gap-1 px-2 pb-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <ComposerBtn icon={<Paperclip size={16} />} onClick={() => fileInputRef.current?.click()} tooltip="Attach file"
            loading={uploading} />
          <ComposerBtn icon={<Smile size={16} />} onClick={() => setShowEmoji(!showEmoji)} tooltip="Emoji" active={showEmoji} />
          <ComposerBtn icon={<AtSign size={16} />} onClick={() => {
            setContent((c) => c + '@')
            textareaRef.current?.focus()
          }} tooltip="Mention" />

          <div className="flex-1" />

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!canSend}
            className="p-2 rounded-xl transition-all"
            style={{
              background: canSend ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: canSend ? 'white' : 'var(--text-muted)',
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-4 z-50 rounded-2xl overflow-hidden shadow-panel"
            style={{ border: '1px solid var(--border)' }}
          >
            <EmojiPicker
              onEmojiClick={(e) => {
                setContent((c) => c + e.emoji)
                textareaRef.current?.focus()
              }}
              theme="auto"
              height={380}
              width={320}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ComposerBtn({ icon, onClick, tooltip, active, loading }) {
  return (
    <button
      onClick={onClick}
      data-tooltip={tooltip}
      disabled={loading}
      className="p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
      style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {loading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} /> : icon}
    </button>
  )
}

function FormatBtn({ icon, onClick, tooltip }) {
  return (
    <button
      onClick={onClick}
      data-tooltip={tooltip}
      className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
      style={{ color: 'var(--text-secondary)' }}
    >
      {icon}
    </button>
  )
}
