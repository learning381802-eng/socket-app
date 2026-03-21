import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Video, Info, Search, MoreVertical, Hash, Lock } from 'lucide-react'
import { useStore } from '../../store'
import { getMessages, subscribeToMessages, supabase } from '../../lib/supabase'
import MessageList from './MessageList'
import MessageComposer from './MessageComposer'
import Avatar from '../ui/Avatar'

export default function MainPanel() {
  const { id } = useParams()
  const {
    user, conversations, activeConversation, setActiveConversation,
    messages, setMessages, addMessage, messagesLoading, setMessagesLoading,
    typingUsers, rightPanelOpen, setRightPanelOpen, setRightPanelTab,
    setMembers, addNotification,
  } = useStore()

  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const realtimeRef = useRef(null)

  // Sync active conversation from URL
  useEffect(() => {
    if (id && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === id)
      if (conv && activeConversation?.id !== id) {
        setActiveConversation(conv)
      }
    }
  }, [id, conversations])

  // Load messages when conversation changes
  useEffect(() => {
    if (!id) return
    loadMessages(id)
    loadMembers(id)

    // Subscribe to realtime messages
    if (realtimeRef.current) realtimeRef.current.unsubscribe()
    realtimeRef.current = subscribeToMessages(id, async (payload) => {
      // Fetch full message with user data
      const { data } = await supabase
        .from('messages')
        .select('*, users!sender_id (id, display_name, avatar_url, status)')
        .eq('id', payload.new.id)
        .single()
      if (data) {
        addMessage(data)
        if (data.sender_id !== user?.id) {
          const senderName = data.users?.display_name || 'Someone'
          addNotification({ type: 'message', message: `${senderName}: ${String(data.content).slice(0, 60)}` })
        }
      }
    })

    return () => realtimeRef.current?.unsubscribe()
  }, [id])

  const loadMessages = async (convId, offset = 0) => {
    if (offset === 0) setMessagesLoading(true)
    else setLoadingMore(true)
    const { data } = await getMessages(convId, 50, offset)
    if (data) {
      if (offset === 0) setMessages(data)
      else setMessages([...data, ...useStore.getState().messages])
      setHasMore(data.length === 50)
    }
    setMessagesLoading(false)
    setLoadingMore(false)
  }

  const loadMembers = async (convId) => {
    const { data } = await supabase
      .from('memberships')
      .select('*, users (id, display_name, avatar_url, email, status)')
      .eq('conversation_id', convId)
    if (data) setMembers(data.map((m) => ({ ...m.users, role: m.role })))
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadMessages(id, messages.length)
    }
  }, [id, messages.length, loadingMore, hasMore])

  const conv = activeConversation
  const isSpace = conv?.type === 'space'
  const convName = conv?.name || 'Unknown'
  const typing = typingUsers[id] || {}
  const typingNames = Object.keys(typing)

  const openInfo = (tab = 'members') => {
    setRightPanelTab(tab)
    setRightPanelOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isSpace ? (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              #
            </div>
          ) : (
            <Avatar name={convName} size={36} />
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {convName}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isSpace ? 'Space' : conv?.type === 'group' ? 'Group chat' : 'Direct message'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <HeaderBtn icon={<Phone size={16} />} tooltip="Voice call" />
          <HeaderBtn icon={<Video size={16} />} tooltip="Video call" />
          <HeaderBtn icon={<Search size={16} />} tooltip="Search in conversation" />
          <HeaderBtn
            icon={<Info size={16} />}
            tooltip="Info"
            active={rightPanelOpen}
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          />
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          loading={messagesLoading}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          hasMore={hasMore}
          currentUserId={user?.id}
        />
      </div>

      {/* Typing indicator */}
      <AnimatePresence>
        {typingNames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="px-5 py-1 flex items-center gap-2"
          >
            <div className="flex gap-1 items-center">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {typingNames.length === 1
                ? 'Someone is typing...'
                : `${typingNames.length} people are typing...`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <MessageComposer conversationId={id} />
    </div>
  )
}

function HeaderBtn({ icon, tooltip, active, onClick }) {
  return (
    <button
      onClick={onClick}
      data-tooltip={tooltip}
      className="p-2 rounded-xl transition-all active:scale-95"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-subtle)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-secondary)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? 'var(--accent-subtle)' : 'transparent' }}
    >
      {icon}
    </button>
  )
}
