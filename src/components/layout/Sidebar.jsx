import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Hash, Search, Plus, ChevronDown,
  ChevronRight, Settings, Moon, Sun, Zap, LogOut, User,
  Users, Bell, MoreHorizontal, Circle, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useStore } from '../../store'
import { signOut, searchUsers } from '../../lib/supabase'
import Avatar from '../ui/Avatar'
import NewChatModal from '../chat/NewChatModal'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    user, conversations, activeConversation, setActiveConversation,
    theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed, setModal,
    setSearchOpen, onlineUsers, setRightPanelOpen,
  } = useStore()

  const [dmExpanded, setDmExpanded] = useState(true)
  const [spacesExpanded, setSpacesExpanded] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const dms = conversations.filter((c) => c.type === 'dm' || c.type === 'group')
  const spaces = conversations.filter((c) => c.type === 'space')

  const handleConvClick = (conv) => {
    setActiveConversation(conv)
    const prefix = conv.type === 'space' ? 'space' : conv.type === 'group' ? 'group' : 'dm'
    navigate(`/socket/${prefix}/${conv.id}`)
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const userInitial = displayName[0]?.toUpperCase()

  const openNewChat = () => setModal('new-chat')
  const openNewSpace = () => setModal('new-space')

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const isCollapsed = sidebarCollapsed

  return (
    <motion.div
      className={`flex flex-col h-full shrink-0 overflow-hidden select-none relative transition-all duration-300 ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      style={{ 
        width: isCollapsed ? 64 : 260, 
        background: 'var(--sidebar-bg)', 
        borderRight: '1px solid rgba(255,255,255,0.04)',
        overflow: isCollapsed ? 'hidden' : 'visible'
      }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="sidebar-toggle-btn"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      {/* App header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg badge-gradient flex items-center justify-center shadow-glow-sm">
            <Zap size={14} className="text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-display text-base font-bold" style={{ color: 'var(--sidebar-text)' }}>
              Socket
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <SidebarIconBtn
              icon={<Search size={15} />}
              onClick={() => setSearchOpen(true)}
              tooltip="Search"
            />
            <SidebarIconBtn
              icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              onClick={toggleTheme}
              tooltip="Toggle theme"
            />
          </div>
        )}
      </div>

      {/* Search bar */}
      {!isCollapsed && (
        <div className="px-3 mb-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--sidebar-muted)',
            }}
          >
            <Search size={13} />
            <span>Search messages, people...</span>
            <span className="ml-auto font-mono text-[10px] opacity-60">⌘K</span>
          </button>
        </div>
      )}

      {/* New chat button */}
      {!isCollapsed && (
        <div className="px-3 mb-4">
          <button
            onClick={openNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>
      )}

      {/* Nav */}
      {!isCollapsed && (
        <div className="px-2 mb-2">
          <NavItem
            icon={<Home size={15} />}
            label="Home"
            active={location.pathname === '/'}
            onClick={() => navigate('/socket')}
          />
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 mb-2">
          <NavItemIcon
            icon={<Home size={18} />}
            active={location.pathname === '/'}
            onClick={() => navigate('/socket')}
            tooltip="Home"
          />
        </div>
      )}

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4 sidebar-expanded-content">
        {/* Direct Messages */}
        <SectionHeader
          label="Direct Messages"
          expanded={dmExpanded}
          onToggle={() => setDmExpanded(!dmExpanded)}
          onAdd={openNewChat}
        />
        <AnimatePresence>
          {dmExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden space-y-0.5"
            >
              {dms.length === 0 ? (
                <p className="text-xs px-3 py-2 opacity-50" style={{ color: 'var(--sidebar-muted)' }}>
                  No direct messages yet
                </p>
              ) : (
                dms.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    active={activeConversation?.id === conv.id}
                    onClick={() => handleConvClick(conv)}
                    online={onlineUsers[conv.id]}
                    user={user}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spaces */}
        <div className="pt-2">
          <SectionHeader
            label="Spaces"
            expanded={spacesExpanded}
            onToggle={() => setSpacesExpanded(!spacesExpanded)}
            onAdd={openNewSpace}
          />
          <AnimatePresence>
            {spacesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden space-y-0.5"
              >
                {spaces.length === 0 ? (
                  <p className="text-xs px-3 py-2 opacity-50" style={{ color: 'var(--sidebar-muted)' }}>
                    No spaces yet
                  </p>
                ) : (
                  spaces.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      active={activeConversation?.id === conv.id}
                      onClick={() => handleConvClick(conv)}
                      user={user}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User profile footer */}
      <div className={`p-3 border-t ${isCollapsed ? 'px-2' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="relative">
          <button
            onClick={() => isCollapsed ? setRightPanelOpen(true) : setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isCollapsed ? 'justify-center px-2' : ''}`}
            style={{ '&:hover': { background: 'var(--sidebar-hover)' } }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sidebar-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title={isCollapsed ? 'Profile' : ''}
          >
            <div className="relative shrink-0">
              <Avatar name={displayName} size={isCollapsed ? 36 : 32} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
                style={{ borderColor: 'var(--sidebar-bg)' }} />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-text)' }}>
                    {displayName}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--sidebar-muted)' }}>Online</p>
                </div>
                <MoreHorizontal size={14} style={{ color: 'var(--sidebar-muted)' }} />
              </>
            )}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl shadow-panel overflow-hidden py-1"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <UserMenuItem 
                  icon={<User size={14} />} 
                  label="Profile" 
                  onClick={() => { setShowUserMenu(false); navigate('/profile') }}
                />
                <UserMenuItem 
                  icon={<Settings size={14} />} 
                  label="Settings" 
                  onClick={() => { setShowUserMenu(false); setModal('settings') }}
                />
                <UserMenuItem icon={<Bell size={14} />} label="Notifications" />
                <div className="my-1 h-px mx-2" style={{ background: 'var(--border)' }} />
                <UserMenuItem
                  icon={<LogOut size={14} />}
                  label="Sign out"
                  danger
                  onClick={() => signOut()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <NewChatModal />
    </motion.div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? 'var(--sidebar-active)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--sidebar-muted)',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
      {label}
    </button>
  )
}

function NavItemIcon({ icon, active, onClick, tooltip }) {
  return (
    <button
      onClick={onClick}
      data-tooltip={tooltip}
      className="w-full flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? 'var(--sidebar-active)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--sidebar-muted)',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
    </button>
  )
}

function SectionHeader({ label, expanded, onToggle, onAdd }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 group">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-100 opacity-70"
        style={{ color: 'var(--sidebar-muted)' }}
      >
        {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {label}
      </button>
      <button
        onClick={onAdd}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
        style={{ color: 'var(--sidebar-muted)' }}
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

function ConvItem({ conv, active, onClick, user, online }) {
  const isSpace = conv.type === 'space'
  const displayName = isSpace ? conv.name : (conv.name || 'Unknown')
  const lastMsg = conv.lastMessage

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left"
      style={{
        background: active ? 'var(--sidebar-active)' : 'transparent',
        color: active ? 'var(--sidebar-text)' : 'var(--sidebar-muted)',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <div className="relative shrink-0">
        {isSpace ? (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(97,115,243,0.2)', color: 'var(--accent)' }}>
            #
          </div>
        ) : (
          <div className="relative">
            <Avatar name={displayName} size={28} />
            {online && (
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border-2"
                style={{ borderColor: 'var(--sidebar-bg)' }} />
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: active ? 'var(--sidebar-text)' : 'inherit' }}>
          {displayName}
        </p>
        {lastMsg && (
          <p className="text-[11px] truncate opacity-60">
            {typeof lastMsg.content === 'string' ? lastMsg.content : '📎 Attachment'}
          </p>
        )}
      </div>
    </button>
  )
}

function SidebarIconBtn({ icon, onClick, tooltip }) {
  return (
    <button
      onClick={onClick}
      data-tooltip={tooltip}
      className="p-2 rounded-lg transition-all hover:bg-white/10 active:scale-95"
      style={{ color: 'var(--sidebar-muted)' }}
    >
      {icon}
    </button>
  )
}

function UserMenuItem({ icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      style={{ color: danger ? '#f87171' : 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </button>
  )
}
