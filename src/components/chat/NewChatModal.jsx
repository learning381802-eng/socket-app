import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Users, Hash, Check, Plus } from 'lucide-react'
import { useStore } from '../../store'
import { searchUsers, createDM, createSpace, supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'
import { useNavigate } from 'react-router-dom'

export default function NewChatModal() {
  const { modal, setModal, user, addConversation, setActiveConversation, addNotification } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [spaceName, setSpaceName] = useState('')
  const [loading, setLoading] = useState(false)

  const isNewChat = modal === 'new-chat'
  const isNewSpace = modal === 'new-space'
  const isNewGroup = modal === 'new-group'
  const isOpen = isNewChat || isNewSpace || isNewGroup

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setSelected([])
      setSpaceName('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await searchUsers(query)
      setResults((data || []).filter((u) => u.id !== user?.id))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const toggleSelect = (u) => {
    if (isNewChat) {
      setSelected([u])
    } else {
      setSelected((prev) =>
        prev.find((p) => p.id === u.id) ? prev.filter((p) => p.id !== u.id) : [...prev, u]
      )
    }
  }

  const handleCreate = async () => {
    if (!user) return
    setLoading(true)
    try {
      if (isNewSpace) {
        if (!spaceName.trim()) return
        const { data, error } = await createSpace(spaceName.trim(), user.id)
        if (error) throw error
        // Add selected members
        if (selected.length > 0) {
          await supabase.from('memberships').insert(
            selected.map((u) => ({ user_id: u.id, conversation_id: data.id, role: 'member' }))
          )
        }
        addConversation({ ...data, role: 'admin' })
        setActiveConversation({ ...data, role: 'admin' })
        navigate(`/space/${data.id}`)
      } else if (isNewChat && selected.length === 1) {
        const conv = await createDM(user.id, selected[0].id)
        if (conv) {
          addConversation(conv)
          setActiveConversation(conv)
          navigate(`/dm/${conv.id}`)
        }
      } else if (isNewGroup && selected.length >= 2) {
        const { data: conv } = await supabase
          .from('conversations')
          .insert({ type: 'group', name: selected.map((u) => u.display_name).join(', ') })
          .select().single()
        if (conv) {
          await supabase.from('memberships').insert([
            { user_id: user.id, conversation_id: conv.id, role: 'admin' },
            ...selected.map((u) => ({ user_id: u.id, conversation_id: conv.id, role: 'member' })),
          ])
          addConversation({ ...conv, role: 'admin' })
          setActiveConversation({ ...conv, role: 'admin' })
          navigate(`/group/${conv.id}`)
        }
      }
      setModal(null)
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to create conversation' })
    } finally {
      setLoading(false)
    }
  }

  const canCreate =
    (isNewSpace && spaceName.trim().length > 0) ||
    (isNewChat && selected.length === 1) ||
    (isNewGroup && selected.length >= 2)

  const title = isNewSpace ? 'Create a Space' : isNewGroup ? 'New Group Message' : 'New Message'
  const placeholder = isNewSpace ? 'Search people to invite...' : 'Search by name or email...'

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
              className="w-full max-w-md rounded-3xl shadow-panel pointer-events-auto overflow-hidden"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {/* Space name input */}
                {isNewSpace && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Space name
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <Hash size={15} style={{ color: 'var(--text-muted)' }} />
                      <input
                        autoFocus
                        value={spaceName}
                        onChange={(e) => setSpaceName(e.target.value)}
                        placeholder="e.g. design-team, announcements"
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                )}

                {/* Search */}
                <div>
                  {isNewSpace && (
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Invite people (optional)
                    </label>
                  )}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <Search size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                      autoFocus={!isNewSpace}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Selected chips */}
                {selected.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selected.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)' + '40' }}>
                        <Avatar name={u.display_name} size={20} />
                        {u.display_name}
                        <button onClick={() => toggleSelect(u)} className="ml-1 opacity-60 hover:opacity-100">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Results */}
                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden rounded-2xl"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      {results.map((u) => {
                        const isSelected = selected.find((s) => s.id === u.id)
                        return (
                          <button
                            key={u.id}
                            onClick={() => toggleSelect(u)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <Avatar name={u.display_name} size={36} src={u.avatar_url} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {u.display_name}
                              </p>
                              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {u.email}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--accent)' }}>
                                <Check size={11} className="text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={!canCreate || loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{
                    background: canCreate ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: canCreate ? 'white' : 'var(--text-muted)',
                    cursor: canCreate ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    isNewSpace ? 'Create Space' : isNewGroup ? `Create Group (${selected.length} people)` : 'Open Chat'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
