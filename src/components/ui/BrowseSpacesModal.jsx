import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Search, Hash, Users, Lock, Globe, Plus, Star } from 'lucide-react'
import { useStore } from '../../store'

const SPACES = [
  { id: 1, name: 'Engineering Team', description: 'Main engineering discussions', members: 24, type: 'public', joined: false },
  { id: 2, name: 'Product Updates', description: 'Latest product announcements', members: 156, type: 'public', joined: false },
  { id: 3, name: 'Design System', description: 'UI/UX design collaboration', members: 18, type: 'public', joined: true },
  { id: 4, name: 'Random', description: 'Off-topic conversations', members: 89, type: 'public', joined: false },
  { id: 5, name: 'Project Alpha', description: 'Confidential project discussions', members: 8, type: 'private', joined: false },
  { id: 6, name: 'Marketing', description: 'Marketing team coordination', members: 32, type: 'public', joined: false },
]

export default function BrowseSpacesModal() {
  const { setModal } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, public, private

  const filteredSpaces = SPACES.filter((space) => {
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || space.type === filter
    return matchesSearch && matchesFilter
  })

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
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Browse Spaces</h2>
            <p className="modal-subtitle">Discover and join public spaces</p>
          </div>
          <button onClick={() => setModal(null)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Search and Filter */}
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
            All Spaces
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`browse-spaces-filter ${filter === 'public' ? 'active' : ''}`}
          >
            <Globe size={14} />
            Public
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`browse-spaces-filter ${filter === 'private' ? 'active' : ''}`}
          >
            <Lock size={14} />
            Private
          </button>
        </div>

        {/* Spaces List */}
        <div className="browse-spaces-list">
          {filteredSpaces.map((space) => (
            <div key={space.id} className="browse-space-item">
              <div className="browse-space-icon">
                {space.type === 'private' ? <Lock size={18} /> : <Globe size={18} />}
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
                  <span className="browse-space-type">{space.type}</span>
                </div>
              </div>
              <button
                className={`browse-space-action ${space.joined ? 'joined' : ''}`}
              >
                {space.joined ? (
                  <>
                    <Star size={16} />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
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
