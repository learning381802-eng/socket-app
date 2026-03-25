import { useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from '../store'
import { supabase, getConversations, subscribeToPresence } from '../lib/supabase'
import GlobalHeader from '../components/layout/GlobalHeader'
import Sidebar from '../components/layout/Sidebar'
import MainPanel from '../components/chat/MainPanel'
import WelcomePanel from '../components/chat/WelcomePanel'
import RightPanel from '../components/layout/RightPanel'
import SearchOverlay from '../components/ui/SearchOverlay'
import Modal from '../components/ui/Modal'
import NotificationStack from '../components/ui/NotificationStack'
import MentionsPage from './MentionsPage'
import StarredPage from './StarredPage'

export default function ChatLayout() {
  const {
    user, setConversations, addConversation, rightPanelOpen,
    sidebarCollapsed, setOnlineUsers, searchOpen, modal, setActiveView, activeView,
  } = useStore()

  // Load conversations
  useEffect(() => {
    if (!user) return
    loadConversations()

    // Subscribe to new memberships (new conversations)
    const sub = supabase
      .channel('memberships:' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'memberships',
        filter: `user_id=eq.${user.id}`,
      }, () => loadConversations())
      .subscribe()

    return () => sub.unsubscribe()
  }, [user])

  // Presence
  useEffect(() => {
    if (!user) return
    const channel = subscribeToPresence('socket:presence', user.id, () => {
      const state = channel.presenceState()
      const online = {}
      Object.values(state).flat().forEach((p) => {
        online[p.user_id] = true
      })
      setOnlineUsers(online)
    })
    return () => channel.unsubscribe()
  }, [user])

  const loadConversations = useCallback(async () => {
    if (!user) return
    const { data } = await getConversations(user.id)
    if (data) {
      const convs = data.map((m) => ({
        ...m.conversations,
        role: m.role,
        lastMessage: m.conversations?.messages?.[m.conversations.messages.length - 1] || null,
      })).filter(Boolean)
      setConversations(convs)
    }
  }, [user])

  return (
    <div className="chat-layout">
      {/* Global Header */}
      <GlobalHeader />

      {/* Main content area */}
      <div className="chat-content">
        {/* Sidebar */}
        <Sidebar />

        {/* Main panel */}
        <div className={`chat-main ${sidebarCollapsed ? 'chat-main-centered' : ''}`}>
          <Routes>
            <Route path="/" element={<WelcomePanel />} />
            <Route path="/socket" element={<WelcomePanel />} />
            <Route path="/socket/mentions" element={<MentionsPage />} />
            <Route path="/socket/starred" element={<StarredPage />} />
            <Route path="dm/:id" element={<MainPanel />} />
            <Route path="space/:id" element={<MainPanel />} />
            <Route path="group/:id" element={<MainPanel />} />
          </Routes>
        </div>

        {/* Right panel */}
        {rightPanelOpen && <RightPanel />}
      </div>

      {/* Overlays */}
      {searchOpen && <SearchOverlay />}
      {modal && <Modal />}

      {/* Notifications */}
      <NotificationStack />
    </div>
  )
}
