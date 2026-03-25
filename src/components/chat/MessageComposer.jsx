import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Paperclip, Smile, Send, X, Bold, Italic, Code,
  Sparkles, Mic, Image as ImageIcon, FileText, Plus,
  Calendar, ChevronDown
} from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useStore } from '../../store'
import { sendMessage, uploadFile, supabase } from '../../lib/supabase'

export default function MessageComposer({ conversationId }) {
  const { user, addOptimisticMessage, confirmMessage, addNotification, setTypingUser, setModal } = useStore()
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showFormatToolbar, setShowFormatToolbar] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
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
    setShowFormatToolbar(false)
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
    setContent((prev) => prev + (emoji.getUnified ? emoji.getUnified() : emoji.native))
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const applyFormat = (format) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = content

    let before = text.substring(0, start)
    let selected = text.substring(start, end)
    let after = text.substring(end)

    if (format === 'bold') {
      selected = `**${selected}**`
    } else if (format === 'italic') {
      selected = `_${selected}_`
    } else if (format === 'code') {
      selected = `\`${selected}\``
    }

    setContent(before + selected + after)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 1, end + 1)
    }, 0)
  }

  const handleGeminiRewrite = () => {
    // Placeholder for Gemini AI integration
    addNotification({ type: 'info', message: 'Gemini Magic Rewrite coming soon!' })
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    addNotification({ type: 'info', message: isRecording ? 'Recording stopped' : 'Recording...' })
  }

  const openPlusMenu = () => {
    setModal('attachment-menu')
  }

  const canSend = content.trim().length > 0 || attachments.length > 0

  return (
    <div className="message-composer">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="composer-attachments">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="composer-attachment-item"
            >
              {att.type?.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="composer-attachment-image" />
              ) : (
                <div className="composer-attachment-file">
                  <FileText size={20} />
                  <span className="composer-attachment-name">{att.name}</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="composer-attachment-remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="composer-input-wrapper">
        {/* Plus menu */}
        <button
          onClick={openPlusMenu}
          className="composer-btn composer-plus-btn"
          data-tooltip="Add attachment"
        >
          <Plus size={20} />
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
          onFocus={() => setShowFormatToolbar(true)}
          onBlur={() => setTimeout(() => setShowFormatToolbar(false), 200)}
          placeholder="Type a message"
          className="composer-textarea"
          rows={1}
        />

        {/* Actions */}
        <div className="composer-actions">
          {/* Formatting toolbar */}
          <AnimatePresence>
            {showFormatToolbar && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="format-toolbar"
              >
                <button onClick={() => applyFormat('bold')} className="format-btn" data-tooltip="Bold">
                  <Bold size={16} />
                </button>
                <button onClick={() => applyFormat('italic')} className="format-btn" data-tooltip="Italic">
                  <Italic size={16} />
                </button>
                <button onClick={() => applyFormat('code')} className="format-btn" data-tooltip="Code">
                  <Code size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="composer-right-actions">
            {/* Gemini AI Button */}
            <button
              onClick={handleGeminiRewrite}
              className="composer-btn composer-gemini-btn"
              data-tooltip="Gemini Magic Rewrite"
            >
              <Sparkles size={18} />
            </button>

            {/* Emoji picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="composer-btn"
                data-tooltip="Emoji"
              >
                <Smile size={20} />
              </button>
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="emoji-picker-popover"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                      skinTonesDisabled
                      searchDisabled
                      width={320}
                      height={400}
                    />
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
              className="composer-btn"
              data-tooltip="Upload file"
            >
              {uploading ? (
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <Paperclip size={20} />
              )}
            </button>

            {/* Voice message */}
            <button
              onClick={handleVoiceRecord}
              className={`composer-btn ${isRecording ? 'recording' : ''}`}
              data-tooltip={isRecording ? 'Stop recording' : 'Voice message'}
            >
              <Mic size={20} />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`composer-send-btn ${canSend ? 'active' : ''}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
