import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Bell, Moon, Sun, Monitor, Palette, User, Lock,
  Globe, Shield, Database, Trash2, Check, ChevronRight,
  Eye, EyeOff, Volume2, VolumeX, Zap, Clock, AlertCircle
} from 'lucide-react'
import { useStore } from '../../store'

const THEMES = [
  { id: 'light', name: 'Light', icon: Sun, preview: '#ffffff' },
  { id: 'dark', name: 'Dark', icon: Moon, preview: '#191921' },
  { id: 'system', name: 'System', icon: Monitor, preview: 'linear-gradient(135deg, #fff 50%, #191921 50%)' },
]

const ACCENT_COLORS = [
  { id: 'blue', name: 'Ocean', color: '#1a73e8' },
  { id: 'purple', name: 'Amethyst', color: '#8ab4f8' },
  { id: 'green', name: 'Forest', color: '#1e8e3e' },
  { id: 'orange', name: 'Sunset', color: '#e37400' },
  { id: 'red', name: 'Cherry', color: '#c5221f' },
  { id: 'teal', name: 'Teal', color: '#00897b' },
]

const NOTIFICATION_TYPES = [
  { id: 'all', label: 'All messages', description: 'Get notified about every message' },
  { id: 'mentions', label: 'Mentions only', description: 'Only when someone mentions you' },
  { id: 'none', label: 'Nothing', description: 'Disable all notifications' },
]

export default function SettingsModal() {
  const { setModal, settings, updateSettings, theme, toggleTheme, user } = useStore()
  const [activeTab, setActiveTab] = useState('general')
  
  // Local state that syncs with store
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    updateSettings({ [key]: value })
    
    // Handle theme changes
    if (key === 'themeMode') {
      if (value === 'dark' && theme !== 'dark') toggleTheme()
      if (value === 'light' && theme === 'dark') toggleTheme()
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ]

  return (
    <div className="settings-modal-backdrop" onClick={() => setModal(null)}>
      <motion.div
        className="settings-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-header">
          <div>
            <h2 className="settings-title">Settings</h2>
            <p className="settings-subtitle">Manage your account and preferences</p>
          </div>
          <button onClick={() => setModal(null)} className="settings-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight size={16} className="settings-tab-chevron" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Settings Panel */}
          <div className="settings-panel">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <GeneralSettings settings={localSettings} updateSetting={updateSetting} user={user} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsSettings settings={localSettings} updateSetting={updateSetting} />
              )}
              {activeTab === 'privacy' && (
                <PrivacySettings settings={localSettings} updateSetting={updateSetting} />
              )}
              {activeTab === 'appearance' && (
                <AppearanceSettings settings={localSettings} updateSetting={updateSetting} theme={theme} />
              )}
              {activeTab === 'advanced' && (
                <AdvancedSettings settings={localSettings} updateSetting={updateSetting} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function GeneralSettings({ settings, updateSetting, user }) {
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''
  const email = user?.email || ''
  
  return (
    <motion.div
      className="settings-section"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      <div className="settings-section-header">
        <h3>Profile Information</h3>
        <p>Your public profile details</p>
      </div>

      <div className="settings-form-group">
        <label className="settings-label">Display Name</label>
        <input
          type="text"
          value={settings.displayName || displayName}
          onChange={(e) => updateSetting('displayName', e.target.value)}
          className="settings-input"
          placeholder="Your name"
        />
      </div>

      <div className="settings-form-group">
        <label className="settings-label">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="settings-input settings-input-disabled"
        />
        <p className="settings-hint">Email cannot be changed</p>
      </div>

      <div className="settings-form-group">
        <label className="settings-label">Status Message</label>
        <input
          type="text"
          value={settings.statusMessage || ''}
          onChange={(e) => updateSetting('statusMessage', e.target.value)}
          className="settings-input"
          placeholder="What's on your mind?"
          maxLength={50}
        />
        <p className="settings-hint">{(settings.statusMessage || '').length}/50 characters</p>
      </div>

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Account</h3>
      </div>

      <button className="settings-danger-btn">
        <Trash2 size={16} />
        <span>Delete Account</span>
      </button>
    </motion.div>
  )
}

function NotificationsSettings({ settings, updateSetting }) {
  return (
    <motion.div
      className="settings-section"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      <div className="settings-section-header">
        <h3>Notification Preferences</h3>
        <p>Choose how you want to be notified</p>
      </div>

      <div className="settings-option-group">
        <label className="settings-option-label">Notify me about</label>
        {NOTIFICATION_TYPES.map((type) => (
          <label key={type.id} className="settings-radio-option">
            <input
              type="radio"
              name="notificationType"
              checked={settings.notificationType === type.id}
              onChange={() => updateSetting('notificationType', type.id)}
              className="settings-radio"
            />
            <div className="settings-radio-content">
              <span className="settings-radio-title">{type.label}</span>
              <span className="settings-radio-desc">{type.description}</span>
            </div>
            {settings.notificationType === type.id && (
              <Check size={18} className="settings-radio-check" />
            )}
          </label>
        ))}
      </div>

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Notification Channels</h3>
      </div>

      <SettingsToggle
        label="Desktop notifications"
        description="Show notifications on your desktop"
        icon={Bell}
        checked={settings.desktopNotifications}
        onChange={(v) => updateSetting('desktopNotifications', v)}
      />

      <SettingsToggle
        label="Sound"
        description="Play sound for notifications"
        icon={settings.soundEnabled ? Volume2 : VolumeX}
        checked={settings.soundEnabled}
        onChange={(v) => updateSetting('soundEnabled', v)}
      />

      <SettingsToggle
        label="Email notifications"
        description="Receive notification emails"
        icon={Globe}
        checked={settings.emailNotifications}
        onChange={(v) => updateSetting('emailNotifications', v)}
      />
    </motion.div>
  )
}

function PrivacySettings({ settings, updateSetting }) {
  return (
    <motion.div
      className="settings-section"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      <div className="settings-section-header">
        <h3>Privacy Settings</h3>
        <p>Control your visibility and interactions</p>
      </div>

      <SettingsToggle
        label="Show online status"
        description="Let others see when you're online"
        icon={settings.showOnlineStatus ? Eye : EyeOff}
        checked={settings.showOnlineStatus}
        onChange={(v) => updateSetting('showOnlineStatus', v)}
      />

      <SettingsToggle
        label="Read receipts"
        description="Show when you've read messages"
        icon={Check}
        checked={settings.showReadReceipts}
        onChange={(v) => updateSetting('showReadReceipts', v)}
      />

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Direct Messages</h3>
      </div>

      <div className="settings-form-group">
        <label className="settings-label">Who can send you direct messages</label>
        <select
          value={settings.allowDirectMessages}
          onChange={(e) => updateSetting('allowDirectMessages', e.target.value)}
          className="settings-select"
        >
          <option value="everyone">Everyone</option>
          <option value="contacts">Contacts only</option>
          <option value="none">Nobody</option>
        </select>
      </div>

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Blocked Users</h3>
      </div>

      <div className="settings-empty-state">
        <Shield size={40} className="settings-empty-icon" />
        <p className="settings-empty-title">No blocked users</p>
        <p className="settings-empty-text">
          Blocked users won't be able to message you or see your status
        </p>
      </div>
    </motion.div>
  )
}

function AppearanceSettings({ settings, updateSetting }) {
  return (
    <motion.div
      className="settings-section"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      <div className="settings-section-header">
        <h3>Theme</h3>
        <p>Customize the look and feel</p>
      </div>

      <div className="settings-theme-grid">
        {THEMES.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => updateSetting('themeMode', t.id)}
              className={`settings-theme-option ${settings.themeMode === t.id ? 'active' : ''}`}
            >
              <div
                className="settings-theme-preview"
                style={{ background: t.preview }}
              />
              <Icon size={20} className="settings-theme-icon" />
              <span className="settings-theme-name">{t.name}</span>
              {settings.themeMode === t.id && (
                <Check size={18} className="settings-theme-check" />
              )}
            </button>
          )
        })}
      </div>

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Accent Color</h3>
      </div>

      <div className="settings-color-grid">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => updateSetting('accentColor', c.id)}
            className={`settings-color-option ${settings.accentColor === c.id ? 'active' : ''}`}
            style={{ background: c.color }}
            data-tooltip={c.name}
          >
            {settings.accentColor === c.id && <Check size={18} color="white" />}
          </button>
        ))}
      </div>

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Layout</h3>
      </div>

      <div className="settings-form-group">
        <label className="settings-label">Message density</label>
        <select
          value={settings.messageDensity}
          onChange={(e) => updateSetting('messageDensity', e.target.value)}
          className="settings-select"
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      <div className="settings-form-group">
        <label className="settings-label">Font size</label>
        <select
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', e.target.value)}
          className="settings-select"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </motion.div>
  )
}

function AdvancedSettings({ settings, updateSetting }) {
  return (
    <motion.div
      className="settings-section"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      <div className="settings-section-header">
        <h3>Advanced Settings</h3>
        <p>Fine-tune your experience</p>
      </div>

      <SettingsToggle
        label="Auto-play GIFs"
        description="Automatically play animated GIFs"
        icon={Zap}
        checked={settings.autoPlayGifs}
        onChange={(v) => updateSetting('autoPlayGifs', v)}
      />

      <SettingsToggle
        label="Show emoji previews"
        description="Display emoji images in messages"
        icon={AlertCircle}
        checked={settings.showEmojis}
        onChange={(v) => updateSetting('showEmojis', v)}
      />

      <SettingsToggle
        label="Press Enter to send"
        description="Send messages with Enter key"
        icon={Check}
        checked={settings.enterToSend}
        onChange={(v) => updateSetting('enterToSend', v)}
      />

      <SettingsToggle
        label="Compress images"
        description="Reduce image upload size"
        icon={Database}
        checked={settings.compressImages}
        onChange={(v) => updateSetting('compressImages', v)}
      />

      <div className="settings-section-header settings-section-header-spaced">
        <h3>Data & Storage</h3>
      </div>

      <div className="settings-storage-info">
        <div className="settings-storage-bar">
          <div className="settings-storage-used" style={{ width: '23%' }} />
        </div>
        <p className="settings-storage-text">
          <strong>2.3 GB</strong> of <strong>10 GB</strong> used
        </p>
      </div>

      <button className="settings-action-btn">
        <Trash2 size={16} />
        <span>Clear cache</span>
      </button>
    </motion.div>
  )
}

function SettingsToggle({ label, description, icon: Icon, checked, onChange }) {
  return (
    <label className="settings-toggle">
      <div className="settings-toggle-content">
        {Icon && <Icon size={18} className="settings-toggle-icon" />}
        <div className="settings-toggle-text">
          <span className="settings-toggle-label">{label}</span>
          {description && <span className="settings-toggle-desc">{description}</span>}
        </div>
      </div>
      <div className={`settings-switch ${checked ? 'active' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="settings-switch-input"
        />
        <span className="settings-switch-slider" />
      </div>
    </label>
  )
}
