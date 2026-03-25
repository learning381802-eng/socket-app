import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, AtSign, Star, MessageSquare, Hash, Users, Video,
  Plus, ChevronDown, ChevronRight, Compass, Bot, Sparkles,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useStore } from '../../store'
import Avatar from '../ui/Avatar'
import NewChatModal from '../chat/NewChatModal'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    user, conversations, activeConversation, setActiveConversation,
    sidebarCollapsed, setSidebarCollapsed, setModal,
    onlineUsers,
  } = useStore()

  const [dmExpanded, setDmExpanded] = useState(true)
  const [spacesExpanded, setSpacesExpanded] = useState(true)
  const [meetingsExpanded, setMeetingsExpanded] = useState(false)

  const dms = conversations.filter((c) => c.type === 'dm' || c.type === 'group')
  const spaces = conversations.filter((c) => c.type === 'space')

  const handleConvClick = (conv) => {
    setActiveConversation(conv)
    const prefix = conv.type === 'space' ? 'space' : conv.type === 'group' ? 'group' : 'dm'
    navigate(`/socket/${prefix}/${conv.id}`)
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const openNewChat = () => setModal('new-chat')
  const openNewSpace = () => setModal('new-space')

  const isCollapsed = sidebarCollapsed

  return (
    <motion.aside
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setSidebarCollapsed(!isCollapsed)}
        className="sidebar-toggle-btn"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {/* Top Tier - System Folders */}
        <div className="sidebar-section">
          <NavItem
            icon={<Home size={18} />}
            label="Home"
            active={location.pathname === '/socket' || location.pathname === '/'}
            onClick={() => navigate('/socket')}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<AtSign size={18} />}
            label="Mentions"
            badge={3}
            onClick={() => navigate('/socket/mentions')}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<Star size={18} />}
            label="Starred"
            onClick={() => navigate('/socket/starred')}
            collapsed={isCollapsed}
          />
        </div>

        <div className="sidebar-divider" />

        {/* Direct Messages */}
        {!isCollapsed && (
          <SectionHeader
            label="Direct Messages"
            expanded={dmExpanded}
            onToggle={() => setDmExpanded(!dmExpanded)}
            onAdd={openNewChat}
          />
        )}
        {isCollapsed && (
          <div className="sidebar-section-icon">
            <MessageSquare size={18} />
          </div>
        )}
        <AnimatePresence>
          {dmExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="sidebar-list"
            >
              {dms.length === 0 ? (
                <p className="sidebar-empty">No direct messages yet</p>
              ) : (
                dms.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    active={activeConversation?.id === conv.id}
                    onClick={() => handleConvClick(conv)}
                    online={onlineUsers[conv.id]}
                    collapsed={isCollapsed}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spaces */}
        {!isCollapsed && (
          <>
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
                  className="sidebar-list"
                >
                  {spaces.length === 0 ? (
                    <p className="sidebar-empty">No spaces yet</p>
                  ) : (
                    spaces.map((conv) => (
                      <ConvItem
                        key={conv.id}
                        conv={conv}
                        active={activeConversation?.id === conv.id}
                        onClick={() => handleConvClick(conv)}
                        collapsed={isCollapsed}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Meetings (New in 2026) */}
        {!isCollapsed && (
          <>
            <SectionHeader
              label="Meetings"
              expanded={meetingsExpanded}
              onToggle={() => setMeetingsExpanded(!meetingsExpanded)}
              icon={<Video size={14} />}
            />
            <AnimatePresence>
              {meetingsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="sidebar-list"
                >
                  <p className="sidebar-empty">No recent meetings</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </nav>

      {/* Sidebar Bottom */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <>
            <button
              onClick={() => setModal('browse-spaces')}
              className="sidebar-footer-btn"
            >
              <Compass size={18} />
              <span>Browse Spaces</span>
            </button>
            <button
              onClick={() => setModal('apps')}
              className="sidebar-footer-btn"
            >
              <Bot size={18} />
              <span>Apps</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="sidebar-footer-icon-btn"
              data-tooltip="Browse Spaces"
              onClick={() => setModal('browse-spaces')}
            >
              <Compass size={18} />
            </button>
            <button
              className="sidebar-footer-icon-btn"
              data-tooltip="Apps"
              onClick={() => setModal('apps')}
            >
              <Bot size={18} />
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      <NewChatModal />
    </motion.aside>
  )
}

// Helper Components

function NavItem({ icon, label, active, onClick, collapsed, badge }) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className="sidebar-nav-item-icon"
        data-tooltip={label}
      >
        <div className={`sidebar-nav-icon-wrap ${active ? 'active' : ''}`}>
          {icon}
          {badge && <span className="nav-badge">{badge}</span>}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`sidebar-nav-item ${active ? 'active' : ''}`}
    >
      <span className="sidebar-nav-icon">{icon}</span>
      <span className="sidebar-nav-label">{label}</span>
      {badge && <span className="sidebar-nav-badge">{badge}</span>}
    </button>
  )
}

function SectionHeader({ label, expanded, onToggle, onAdd, icon }) {
  return (
    <div className="section-header">
      <button
        onClick={onToggle}
        className="section-header-btn"
      >
        {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {icon && <span className="section-header-icon">{icon}</span>}
        <span className="section-header-label">{label}</span>
      </button>
      {onAdd && (
        <button
          onClick={onAdd}
          className="section-header-add"
        >
          <Plus size={13} />
        </button>
      )}
    </div>
  )
}

function ConvItem({ conv, active, onClick, online, collapsed }) {
  const isSpace = conv.type === 'space'
  const displayName = isSpace ? conv.name : (conv.name || 'Unknown')
  const lastMsg = conv.lastMessage

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className="conv-item-icon"
        data-tooltip={displayName}
      >
        {isSpace ? (
          <div className="conv-space-icon">#</div>
        ) : (
          <div className="conv-avatar-wrap">
            <Avatar name={displayName} size={36} />
            {online && <span className="online-indicator" />}
          </div>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`conv-item ${active ? 'active' : ''}`}
    >
      <div className="conv-avatar">
        {isSpace ? (
          <div className="conv-space-icon">#</div>
        ) : (
          <>
            <Avatar name={displayName} size={32} />
            {online && <span className="online-indicator" />}
          </>
        )}
      </div>
      <div className="conv-content">
        <div className="conv-header">
          <span className="conv-name">{displayName}</span>
        </div>
        {lastMsg && (
          <p className="conv-last-message">
            {typeof lastMsg.content === 'string' ? lastMsg.content : '📎 Attachment'}
          </p>
        )}
      </div>
    </button>
  )
}
