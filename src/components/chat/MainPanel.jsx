import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Video, Info, Search, MoreVertical, Hash, Lock,
  MessageSquare, FileText, CheckSquare, Link as LinkIcon, Sparkles
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('chat')
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

  const TABS = isSpace ? [
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
    { id: 'files', label: 'Files', icon: <FileText size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
    { id: 'board', label: 'Board', icon: <LinkIcon size={16} /> },
  ] : []

  return (
    <div className="main-panel">
      {/* Header */}
      <div className="main-panel-header">
        <div className="header-left">
          {isSpace ? (
            <div className="header-space-icon">
              <Hash size={20} />
            </div>
          ) : (
            <Avatar name={convName} size={36} />
          )}
          <div className="header-info">
            <h2 className="header-title">{convName}</h2>
            <p className="header-subtitle">
              {isSpace ? 'Space' : conv?.type === 'group' ? 'Group chat' : 'Direct message'}
            </p>
          </div>
        </div>

        {/* Tabs (Spaces only) */}
        {isSpace && (
          <div className="header-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`header-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="header-actions">
          <button className="header-action-btn" data-tooltip="Search in conversation">
            <Search size={18} />
          </button>
          <button className="header-action-btn" data-tooltip="Voice call">
            <Phone size={18} />
          </button>
          <button className="header-action-btn" data-tooltip="Video call">
            <Video size={18} />
          </button>
          <button
            className={`header-action-btn ${rightPanelOpen ? 'active' : ''}`}
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            data-tooltip="Info"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Message list */}
      <div className="message-list-container">
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
            className="typing-indicator"
          >
            <div className="typing-dots">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <span className="typing-text">
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
