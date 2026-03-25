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

    // Settings
    settings: {
      displayName: '',
      statusMessage: '',
      notificationsEnabled: true,
      notificationType: 'mentions',
      soundEnabled: true,
      desktopNotifications: true,
      showOnlineStatus: true,
      showReadReceipts: true,
      themeMode: 'system',
      accentColor: 'blue',
      messageDensity: 'comfortable',
    },
    updateSettings: (updates) => {
      const newSettings = { ...get().settings, ...updates }
      localStorage.setItem('socket-settings', JSON.stringify(newSettings))
      set({ settings: newSettings })
    },
    loadSettings: () => {
      try {
        const saved = JSON.parse(localStorage.getItem('socket-settings') || '{}')
        set({ settings: { ...get().settings, ...saved } })
      } catch {}
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
    toggleStarMessage: (msg) => {
      const starred = get().starredMessages
      const exists = starred.find((m) => m.id === msg.id)
      if (exists) {
        set({ starredMessages: starred.filter((m) => m.id !== msg.id) })
      } else {
        set({ starredMessages: [...starred, { ...msg, starredAt: Date.now() }] })
      }
    },

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

    // Mentions
    mentions: [
      {
        id: 'mention-1',
        messageId: 'msg-1',
        conversationId: 'conv-1',
        conversationName: 'Engineering Team',
        senderName: 'Alice Chen',
        senderAvatar: 'AC',
        content: 'Hey @you, can you review this PR?',
        timestamp: Date.now() - 3600000, // 1 hour ago
        read: false,
      },
      {
        id: 'mention-2',
        messageId: 'msg-2',
        conversationId: 'conv-2',
        conversationName: 'Product Updates',
        senderName: 'Bob Smith',
        senderAvatar: 'BS',
        content: '@you The meeting is at 3pm today',
        timestamp: Date.now() - 7200000, // 2 hours ago
        read: false,
      },
      {
        id: 'mention-3',
        messageId: 'msg-3',
        conversationId: 'conv-1',
        conversationName: 'Engineering Team',
        senderName: 'Carol White',
        senderAvatar: 'CW',
        content: 'Thanks @you for the help!',
        timestamp: Date.now() - 86400000, // 1 day ago
        read: true,
      },
    ],
    markMentionRead: (id) => {
      set((s) => ({
        mentions: s.mentions.map((m) => (m.id === id ? { ...m, read: true } : m)),
      }))
    },
    markAllMentionsRead: () => {
      set((s) => ({
        mentions: s.mentions.map((m) => ({ ...m, read: true })),
      }))
    },

    // Starred Messages
    starredMessages: [
      {
        id: 'star-1',
        conversationId: 'conv-1',
        conversationName: 'Engineering Team',
        senderName: 'David Lee',
        senderAvatar: 'DL',
        content: 'Here are the API docs: https://api.example.com/docs',
        timestamp: Date.now() - 172800000, // 2 days ago
        starredAt: Date.now() - 100000000,
      },
      {
        id: 'star-2',
        conversationId: 'conv-3',
        conversationName: 'Design System',
        senderName: 'Eva Martinez',
        senderAvatar: 'EM',
        content: 'New component library is ready for review',
        timestamp: Date.now() - 259200000, // 3 days ago
        starredAt: Date.now() - 150000000,
      },
    ],

    // Modal state
    modal: null,
    setModal: (modal) => set({ modal }),

    // Active view for routing
    activeView: 'home', // home, mentions, starred, chat
    setActiveView: (view) => set({ activeView: view }),
  }))
)
