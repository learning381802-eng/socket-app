import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, Search, Bell, Settings, Grid3x3, Video,
  ChevronDown, X, Moon, Sun, LogOut, User, Info
} from 'lucide-react'
import { useStore } from '../../store'
import { signOut } from '../../lib/supabase'
import Avatar from '../ui/Avatar'

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active', icon: '🟢' },
  { id: 'busy', label: 'Do not disturb', icon: '🔴' },
  { id: 'away', label: 'Away', icon: '🟡' },
  { id: 'vacation', label: 'On vacation', icon: '🌴' },
]

export default function GlobalHeader() {
  const {
    user, sidebarCollapsed, setSidebarCollapsed,
    theme, toggleTheme, searchOpen, setSearchOpen,
    setRightPanelOpen, rightPanelOpen,
  } = useStore()

  const [status, setStatus] = useState('active')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const userInitial = displayName[0]?.toUpperCase()

  const currentStatus = STATUS_OPTIONS.find(s => s.id === status)

  return (
    <header className="global-header">
      <div className="global-header-inner">
        {/* Left Section */}
        <div className="header-left">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="header-icon-btn"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="header-logo" onClick={() => window.location.href = '/socket'}>
            <div className="header-logo-icon">
              <span className="logo-char">S</span>
            </div>
            <span className="header-logo-text">Socket</span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="header-center">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search in Chat"
              className="search-input"
              onFocus={() => setSearchOpen(true)}
              readOnly
            />
            <div className="search-shortcut">⌘K</div>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Status Indicator */}
          <div className="status-wrapper">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="status-btn"
            >
              <span className="status-indicator">{currentStatus?.icon}</span>
              <span className="status-label">{currentStatus?.label}</span>
              <ChevronDown size={14} className="status-chevron" />
            </button>

            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  className="status-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setStatus(opt.id); setShowStatusMenu(false) }}
                      className={`status-option ${status === opt.id ? 'active' : ''}`}
                    >
                      <span className="status-option-icon">{opt.icon}</span>
                      <span className="status-option-label">{opt.label}</span>
                      {status === opt.id && <span className="status-check">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-icon-btn"
            data-tooltip="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Settings */}
          <div className="settings-wrapper">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="header-icon-btn"
              data-tooltip="Settings"
            >
              <Settings size={18} />
            </button>

            <AnimatePresence>
              {showSettingsMenu && (
                <motion.div
                  className="settings-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <button className="settings-dropdown-item">
                    <Bell size={16} />
                    <span>Notifications</span>
                  </button>
                  <button className="settings-dropdown-item">
                    <User size={16} />
                    <span>Blocked users</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => { setShowSettingsMenu(false); setModal('settings') }}
                    className="settings-dropdown-item"
                  >
                    <Settings size={16} />
                    <span>All settings</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Google Apps Launcher */}
          <button
            className="header-icon-btn apps-launcher"
            data-tooltip="Google Apps"
          >
            <Grid3x3 size={18} />
          </button>

          {/* Profile Picture */}
          <div className="profile-wrapper">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="profile-btn"
            >
              <Avatar name={displayName} size={32} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="profile-dropdown-header">
                    <Avatar name={displayName} size={40} />
                    <div className="profile-dropdown-info">
                      <p className="profile-dropdown-name">{displayName}</p>
                      <p className="profile-dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => { setShowUserMenu(false); window.location.href = '/profile' }}
                    className="profile-dropdown-item"
                  >
                    <User size={16} />
                    <span>Your Profile</span>
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); setRightPanelOpen(!rightPanelOpen) }}
                    className="profile-dropdown-item"
                  >
                    <Info size={16} />
                    <span>Account Info</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => { setShowUserMenu(false); signOut() }}
                    className="profile-dropdown-item danger"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
