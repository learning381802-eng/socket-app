// EditProfileModal.tsx - With avatar URL editing
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'

interface Props {
  open: boolean
  onClose: () => void
}

export default function EditProfileModal({ open, onClose }: Props) {
  const { user, setUser } = useStore()
  const [name, setName] = useState(user?.user_metadata?.display_name || '')
  const [bio, setBio] = useState(user?.user_metadata?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    
    const updateData: { data: { display_name: string; bio: string; avatar_url?: string } } = {
      data: { display_name: name, bio },
    }
    
    if (avatarUrl) {
      updateData.data.avatar_url = avatarUrl
    }
    
    const { data, error } = await supabase.auth.updateUser(updateData)
    if (error) {
      setMsg('Failed to save: ' + error.message)
    } else {
      setUser(data.user)
      setMsg('✓ Saved!')
      setTimeout(() => { setMsg(''); onClose() }, 1000)
    }
    setSaving(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For demo: use a data URL or upload to a service
    // In production, you'd upload to Supabase Storage
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setAvatarUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const initial = displayName[0]?.toUpperCase()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            className="ep-backdrop" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
          />
          <motion.div 
            className="ep-wrap" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="ep-modal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="ep-header">
                <h2 className="ep-title">Edit Profile</h2>
                <button className="ep-close" onClick={onClose}>✕</button>
              </div>
              
              <form onSubmit={handleSave} className="ep-form">
                {/* Avatar preview */}
                <div className="ep-avatar-section">
                  <div className="ep-avatar-preview">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="ep-avatar-img" />
                    ) : (
                      <span className="ep-avatar-initial">{initial}</span>
                    )}
                  </div>
                  <div className="ep-avatar-actions">
                    <button
                      type="button"
                      className="ep-avatar-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    {avatarUrl && (
                      <button
                        type="button"
                        className="ep-avatar-remove"
                        onClick={() => setAvatarUrl('')}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="ep-field">
                  <label>Display Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="ep-input"
                    placeholder="Your name"
                    autoFocus
                  />
                </div>
                
                <div className="ep-field">
                  <label>Avatar URL <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="ep-input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div className="ep-field">
                  <label>Bio <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="ep-input ep-textarea"
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    maxLength={160}
                  />
                  <span className="ep-char-count">{bio.length}/160</span>
                </div>
                
                <div className="ep-footer">
                  {msg && <span className={`ep-msg ${msg.startsWith('✓') ? 'success' : 'error'}`}>{msg}</span>}
                  <div className="ep-footer-btns">
                    <button type="button" className="ep-btn-cancel" onClick={onClose}>Cancel</button>
                    <button type="submit" className="ep-btn-save" disabled={saving}>
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
