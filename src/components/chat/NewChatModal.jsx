import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Users, Hash, Check, Plus, Mail, UserPlus, Inbox } from 'lucide-react'
import { useStore } from '../../store'
import {
  searchUsers,
  createDM,
  createSpace,
  createChatInvite,
  getIncomingChatInvites,
  markChatInviteAccepted,
  supabase,
} from '../../lib/supabase'
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
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('people')
  const [incomingInvites, setIncomingInvites] = useState([])
  const [loadingInvites, setLoadingInvites] = useState(false)

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
      setActiveTab('people')
      setIncomingInvites([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!isNewChat || activeTab !== 'invites') return
    loadIncomingInvites()
  }, [isNewChat, activeTab, user?.email])

  const loadIncomingInvites = async () => {
    if (!user?.email) return
    setLoadingInvites(true)
    try {
      const { data } = await getIncomingChatInvites(user.email)
      setIncomingInvites(data || [])
    } finally {
      setLoadingInvites(false)
    }
  }

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        // Try RPC function first, fall back to direct query
        let { data, error } = await supabase.rpc('search_users_by_query', { search_query: query })
        
        if (error || !data) {
          // Fallback to direct query
          const result = await searchUsers(query)
          data = result.data
        }
        
        setResults((data || []).filter((u) => u.id !== user?.id))
      } catch (err) {
        console.error('Search error:', err)
        setResults([])
      } finally {
        setSearching(false)
      }
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

  // Handle creating a DM with an email address (even if user doesn't exist in DB)
  const handleCreateWithInvite = async () => {
    if (!user || !query.trim()) return
    
    // Check if query is an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(query)) return
    
    setLoading(true)
    try {
      // Try to find user by email
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, email, status')
        .eq('email', query.trim().toLowerCase())
        .single()
      
      if (existingUsers) {
        // User exists, create DM
        const conv = await createDM(user.id, existingUsers.id)
        if (conv) {
          addConversation(conv)
          setActiveConversation(conv)
          navigate(`/socket/dm/${conv.id}`)
          setModal(null)
        }
      } else {
        // User doesn't exist - persist invite so they can see it after signup
        const { error: inviteError } = await createChatInvite({
          invitedEmail: query.trim(),
          invitedBy: user.id,
          inviterName: user.user_metadata?.display_name || user.email,
        })
        if (inviteError) throw inviteError
        addNotification({ type: 'success', message: `Invite sent to ${query}` })
        setModal(null)
      }
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to create conversation' })
    } finally {
      setLoading(false)
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
        navigate(`/socket/space/${data.id}`)
      } else if (isNewChat && selected.length === 1) {
        const conv = await createDM(user.id, selected[0].id)
        if (conv) {
          addConversation(conv)
          setActiveConversation(conv)
          navigate(`/socket/dm/${conv.id}`)
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
          navigate(`/socket/group/${conv.id}`)
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

  // Check if query looks like an email for invite option
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailQuery = isNewChat && emailRegex.test(query.trim()) && results.length === 0

  const title = isNewSpace ? 'Create a Space' : isNewGroup ? 'New Group Message' : 'New Message'
  const placeholder = isNewSpace ? 'Search people to invite...' : 'Search by name or email...'

  const acceptInvite = async (invite) => {
    if (!user?.id || loading) return
    setLoading(true)
    try {
      const conv = await createDM(user.id, invite.invited_by)
      if (!conv?.id) throw new Error('Could not create chat from invite')
      await markChatInviteAccepted(invite.id, user.id)
      addConversation(conv)
      setActiveConversation(conv)
      setIncomingInvites((prev) => prev.filter((i) => i.id !== invite.id))
      setModal(null)
      navigate(`/socket/dm/${conv.id}`)
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to accept invite' })
    } finally {
      setLoading(false)
    }
  }

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
                {isNewChat && (
                  <div className="new-chat-tabs">
                    <button
                      className={`new-chat-tab ${activeTab === 'people' ? 'active' : ''}`}
                      onClick={() => setActiveTab('people')}
                    >
                      <Search size={14} />
                      <span>People</span>
                    </button>
                    <button
                      className={`new-chat-tab ${activeTab === 'invites' ? 'active' : ''}`}
                      onClick={() => setActiveTab('invites')}
                    >
                      <Inbox size={14} />
                      <span>Invites</span>
                      {incomingInvites.length > 0 && <span className="new-chat-tab-badge">{incomingInvites.length}</span>}
                    </button>
                  </div>
                )}

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
                {(!isNewChat || activeTab === 'people') && (
                <div>
                  {isNewSpace && (
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Invite people (optional)
                    </label>
                  )}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <Search size={15} style={{ color: searching ? 'var(--accent)' : 'var(--text-muted)' }} />
                    <input
                      autoFocus={!isNewSpace}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                    {searching && (
                      <div className="w-4 h-4 border-2 border-var(--accent)/30 border-t-var(--accent) rounded-full animate-spin" />
                    )}
                  </div>
                </div>
                )}

                {/* Selected chips */}
                {(!isNewChat || activeTab === 'people') && selected.length > 0 && (
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
                {(!isNewChat || activeTab === 'people') && (
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
                )}

                {/* Email invite option */}
                {(!isNewChat || activeTab === 'people') && isEmailQuery && (
                  <motion.button
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleCreateWithInvite}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl transition-colors"
                    style={{ background: 'var(--accent-subtle)', border: '1px dashed var(--accent)' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--accent)', color: 'white' }}>
                      <Mail size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        Invite {query}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        They'll be able to chat once they sign up
                      </p>
                    </div>
                    <UserPlus size={18} style={{ color: 'var(--accent)' }} />
                  </motion.button>
                )}

                {/* No results message */}
                {(!isNewChat || activeTab === 'people') && query.trim() && results.length === 0 && !isEmailQuery && !searching && (
                  <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No users found matching "{query}"</p>
                    {emailRegex.test(query) && (
                      <p className="text-xs mt-2">Try entering the email to send an invite</p>
                    )}
                  </div>
                )}

                {isNewChat && activeTab === 'invites' && (
                  <div className="new-chat-invites">
                    {loadingInvites ? (
                      <p className="new-chat-invites-empty">Loading invites…</p>
                    ) : incomingInvites.length === 0 ? (
                      <p className="new-chat-invites-empty">No pending invites.</p>
                    ) : (
                      incomingInvites.map((invite) => (
                        <div key={invite.id} className="new-chat-invite-item">
                          <div className="new-chat-invite-content">
                            <p className="new-chat-invite-title">Invite from {invite.inviter_name || invite.invited_by}</p>
                            <p className="new-chat-invite-subtitle">{new Date(invite.created_at).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => acceptInvite(invite)}
                            className="new-chat-invite-accept"
                            disabled={loading}
                          >
                            Accept
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

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
