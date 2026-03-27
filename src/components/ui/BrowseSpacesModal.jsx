import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Search, Hash, Users, Plus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { supabase } from '../../lib/supabase'

export default function BrowseSpacesModal() {
  const navigate = useNavigate()
  const { setModal, user, addConversation, setActiveConversation } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, joined, available
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!user) return

    const loadSpaces = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const { data: allSpaces, error: spaceErr } = await supabase
          .from('conversations')
          .select('id, name, created_at')
          .eq('type', 'space')
          .order('created_at', { ascending: false })
        if (spaceErr) throw spaceErr

        if (!allSpaces?.length) {
          setSpaces([])
          return
        }

        const ids = allSpaces.map((s) => s.id)
        const { data: memberships, error: memberErr } = await supabase
          .from('memberships')
          .select('conversation_id, user_id')
          .in('conversation_id', ids)
        if (memberErr) throw memberErr

        const summary = new Map()
        ;(memberships || []).forEach((row) => {
          const prev = summary.get(row.conversation_id) || { members: 0, joined: false }
          prev.members += 1
          if (row.user_id === user.id) prev.joined = true
          summary.set(row.conversation_id, prev)
        })

        setSpaces(allSpaces.map((space) => {
          const meta = summary.get(space.id) || { members: 0, joined: false }
          return {
            id: space.id,
            name: space.name || 'Untitled Space',
            description: `Created ${new Date(space.created_at).toLocaleDateString()}`,
            members: meta.members,
            joined: meta.joined,
            type: 'space',
          }
        }))
      } catch (err) {
        setLoadError(err.message || 'Could not load spaces')
      } finally {
        setLoading(false)
      }
    }

    loadSpaces()
  }, [user])

  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filter === 'all' ||
        (filter === 'joined' && space.joined) ||
        (filter === 'available' && !space.joined)
      return matchesSearch && matchesFilter
    })
  }, [spaces, searchQuery, filter])

  const openSpace = (space) => {
    const conv = { id: space.id, name: space.name, type: 'space' }
    addConversation(conv)
    setActiveConversation(conv)
    setModal(null)
    navigate(`/socket/space/${space.id}`)
  }

  const handleJoin = async (space) => {
    if (!user || joiningId) return
    if (space.joined) {
      openSpace(space)
      return
    }

    setJoiningId(space.id)
    try {
      const { error } = await supabase.from('memberships').insert({
        user_id: user.id,
        conversation_id: space.id,
        role: 'member',
      })
      if (error) throw error

      setSpaces((prev) => prev.map((s) =>
        s.id === space.id ? { ...s, joined: true, members: s.members + 1 } : s
      ))
      openSpace({ ...space, joined: true })
    } catch (err) {
      setLoadError(err.message || 'Failed to join space')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <motion.div
        className="browse-spaces-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Browse Spaces</h2>
            <p className="modal-subtitle">Discover and join team spaces</p>
          </div>
          <button onClick={() => setModal(null)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="browse-spaces-search">
          <Search size={18} className="browse-spaces-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spaces..."
            className="browse-spaces-input"
          />
        </div>

        <div className="browse-spaces-filters">
          <button
            onClick={() => setFilter('all')}
            className={`browse-spaces-filter ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`browse-spaces-filter ${filter === 'joined' ? 'active' : ''}`}
          >
            Joined
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`browse-spaces-filter ${filter === 'available' ? 'active' : ''}`}
          >
            Available
          </button>
        </div>

        {loadError && <p className="browse-spaces-error">{loadError}</p>}

        <div className="browse-spaces-list">
          {!loading && filteredSpaces.map((space) => (
            <div key={space.id} className="browse-space-item">
              <div className="browse-space-icon">
                <Hash size={18} />
              </div>
              <div className="browse-space-content">
                <div className="browse-space-header">
                  <h3 className="browse-space-name">{space.name}</h3>
                  {space.joined && (
                    <span className="browse-space-joined-badge">
                      <Check size={12} />
                      Joined
                    </span>
                  )}
                </div>
                <p className="browse-space-description">{space.description}</p>
                <div className="browse-space-meta">
                  <span className="browse-space-members">
                    <Users size={14} />
                    {space.members} members
                  </span>
                </div>
              </div>
              <button
                className={`browse-space-action ${space.joined ? 'joined' : ''}`}
                onClick={() => handleJoin(space)}
                disabled={joiningId === space.id}
              >
                {space.joined ? (
                  <>
                    <ArrowRight size={16} />
                    <span>Open</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>{joiningId === space.id ? 'Joining…' : 'Join'}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {loading && (
          <div className="browse-spaces-empty">
            <h3>Loading spaces…</h3>
          </div>
        )}

        {!loading && filteredSpaces.length === 0 && (
          <div className="browse-spaces-empty">
            <Hash size={48} className="browse-spaces-empty-icon" />
            <h3>No spaces found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function Check({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
