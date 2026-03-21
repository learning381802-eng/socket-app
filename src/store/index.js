import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // Auth
    user: null,
    session: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),

    // Theme
    theme: localStorage.getItem('socket-theme') || 'dark',
    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('socket-theme', next)
      set({ theme: next })
      document.documentElement.classList.toggle('dark', next === 'dark')
    },

    // Sidebar
    sidebarCollapsed: false,
    rightPanelOpen: false,
    rightPanelTab: 'members',
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    setRightPanelOpen: (v) => set({ rightPanelOpen: v }),
    setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

    // Conversations
    conversations: [],
    activeConversation: null,
    setConversations: (conversations) => set({ conversations }),
    setActiveConversation: (conv) => set({ activeConversation: conv, messages: [] }),
    addConversation: (conv) =>
      set((s) => ({ conversations: [conv, ...s.conversations.filter((c) => c.id !== conv.id)] })),
    updateConversationLastMessage: (convId, msg) =>
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === convId ? { ...c, lastMessage: msg } : c
        ),
      })),

    // Messages
    messages: [],
    messagesLoading: false,
    setMessages: (messages) => set({ messages }),
    setMessagesLoading: (v) => set({ messagesLoading: v }),
    addMessage: (msg) => {
      set((s) => {
        // Optimistic update: replace temp message if exists
        const exists = s.messages.find((m) => m.id === msg.id || m.tempId === msg.tempId)
        if (exists) {
          return { messages: s.messages.map((m) => (m.id === exists.id ? msg : m)) }
        }
        return { messages: [...s.messages, msg] }
      })
    },
    addOptimisticMessage: (msg) =>
      set((s) => ({ messages: [...s.messages, { ...msg, pending: true }] })),
    confirmMessage: (tempId, realMsg) =>
      set((s) => ({
        messages: s.messages.map((m) => (m.tempId === tempId ? { ...realMsg, pending: false } : m)),
      })),
    removeMessage: (id) =>
      set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

    // Presence & Typing
    onlineUsers: {},
    typingUsers: {},
    setOnlineUsers: (users) => set({ onlineUsers: users }),
    setTypingUser: (convId, userId, isTyping) =>
      set((s) => {
        const conv = { ...(s.typingUsers[convId] || {}) }
        if (isTyping) conv[userId] = true
        else delete conv[userId]
        return { typingUsers: { ...s.typingUsers, [convId]: conv } }
      }),

    // Search
    searchQuery: '',
    searchResults: null,
    searchOpen: false,
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSearchResults: (r) => set({ searchResults: r }),
    setSearchOpen: (v) => set({ searchOpen: v }),

    // Notifications
    notifications: [],
    addNotification: (notif) => {
      const id = Date.now()
      set((s) => ({ notifications: [...s.notifications, { ...notif, id }] }))
      setTimeout(() => {
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
      }, 4000)
    },
    removeNotification: (id) =>
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

    // Members
    members: [],
    setMembers: (members) => set({ members }),

    // Modal state
    modal: null,
    setModal: (modal) => set({ modal }),
  }))
)
