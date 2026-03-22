// EditProfileModal.tsx
import { useState } from 'react'
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
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: name, bio },
    })
    if (error) {
      setMsg('Failed to save: ' + error.message)
    } else {
      setUser(data.user)
      setMsg('✓ Saved!')
      setTimeout(() => { setMsg(''); onClose() }, 1000)
    }
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="ep-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="ep-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                  <label>Bio <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="ep-input ep-textarea"
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    maxLength={120}
                  />
                  <span className="ep-char-count">{bio.length}/120</span>
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
