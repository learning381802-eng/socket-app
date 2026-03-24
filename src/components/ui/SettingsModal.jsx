import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Moon, Sun, Monitor, User, Shield, Palette, Globe, Type } from 'lucide-react'
import { useStore } from '../../store'
import { supabase } from '../../lib/supabase'

export default function SettingsModal() {
  const { modal, setModal, user, theme, toggleTheme } = useStore()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [bio, setBio] = useState(user?.user_metadata?.bio || '')
  const [saving, setSaving] = useState(false)

  const isOpen = modal === 'settings'

  const handleSave = async () => {
    setSaving(true)
    await supabase.auth.updateUser({
      data: { display_name: displayName, bio },
    })
    setSaving(false)
    setModal(null)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setModal(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-lg rounded-3xl shadow-panel pointer-events-auto overflow-hidden"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Settings
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Profile Section */}
                <SettingsSection icon={<User size={16} />} title="Profile">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                        Display Name
                      </label>
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ 
                          background: 'var(--bg-secondary)', 
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        maxLength={160}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                        style={{ 
                          background: 'var(--bg-secondary)', 
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{bio.length}/160</span>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ 
                        background: saving ? 'var(--bg-tertiary)' : 'var(--accent)',
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection icon={<Palette size={16} />} title="Appearance">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                        Theme
                      </label>
                      <div className="flex gap-2">
                        <ThemeOption
                          icon={<Sun size={16} />}
                          label="Light"
                          active={theme === 'light'}
                          onClick={() => theme !== 'light' && toggleTheme()}
                        />
                        <ThemeOption
                          icon={<Moon size={16} />}
                          label="Dark"
                          active={theme === 'dark'}
                          onClick={() => theme !== 'dark' && toggleTheme()}
                        />
                        <ThemeOption
                          icon={<Monitor size={16} />}
                          label="System"
                          active={false}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection icon={<Bell size={16} />} title="Notifications">
                  <div className="space-y-3">
                    <ToggleSetting label="Desktop notifications" defaultChecked />
                    <ToggleSetting label="Message previews" defaultChecked />
                    <ToggleSetting label="Sound effects" defaultChecked />
                    <ToggleSetting label="Mention notifications" defaultChecked />
                  </div>
                </SettingsSection>

                {/* Privacy Section */}
                <SettingsSection icon={<Shield size={16} />} title="Privacy">
                  <div className="space-y-3">
                    <ToggleSetting label="Show online status" defaultChecked />
                    <ToggleSetting label="Allow direct messages from anyone" defaultChecked={false} />
                    <ToggleSetting label="Read receipts" defaultChecked />
                  </div>
                </SettingsSection>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SettingsSection({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ThemeOption({ icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all ${
        active 
          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' 
          : 'border-[var(--border)] bg-[var(--bg-secondary)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--accent)]'}`}
      style={{ 
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function ToggleSetting({ label, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked)
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  )
}
