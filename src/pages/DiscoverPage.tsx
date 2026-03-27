// DiscoverPage.tsx - Find people to chat with
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase, searchUsers } from '../lib/supabase'
import { useStore } from '../store'
import { DiscoverUser } from '../data/users'
import UserCard from '../components/UserCard'
import SearchBar from '../components/SearchBar'

export default function DiscoverPage() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'away' | 'offline'>('all')
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        let data: any[] = []
        if (searchQuery.trim()) {
          const searched = await searchUsers(searchQuery.trim())
          data = searched.data || []
        } else {
          const { data: fetched, error } = await supabase
            .from('users')
            .select('id, display_name, email, avatar_url, bio, status')
            .limit(100)
          if (error) throw error
          data = fetched || []
        }

        const mapped = data
          .filter((row) => row.id !== user?.id)
          .map((row) => ({
            id: row.id,
            displayName: row.display_name || row.email || 'Unknown user',
            email: row.email,
            avatarUrl: row.avatar_url,
            bio: row.bio || '',
            status: row.status || 'offline',
          }))

        setUsers(mapped)
      } catch (err: any) {
        setUsers([])
        setLoadError(err?.message || 'Failed to load people')
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, user?.id])

  const filteredUsers = useMemo(() => {
    return users.filter((person) => {
      const normalizedStatus = person.status === 'active' ? 'online' : person.status
      return statusFilter === 'all' || normalizedStatus === statusFilter
    })
  }, [users, statusFilter])

  const onlineCount = users.filter((u) => u.status === 'online' || u.status === 'active').length

  return (
    <div className="disc-root">
      {/* Header */}
      <nav className="disc-nav">
        <button className="disc-nav-back" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Socket Math
        </button>
        <div className="disc-nav-title-wrap">
          <h1 className="disc-nav-title">Discover</h1>
          <span className="disc-nav-subtitle">Find people to chat with</span>
        </div>
        <button className="disc-nav-profile" onClick={() => navigate('/profile')} title="Go to Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </nav>

      {/* Content */}
      <div className="disc-content">
        {/* Search and filter section */}
        <div className="disc-search-section">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search by username or bio..."
          />
          
          {/* Status filter pills */}
          <div className="disc-filters">
            {(['all', 'online', 'away', 'offline'] as const).map((status) => (
              <button
                key={status}
                className={`disc-filter-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? (
                  <>All Users</>
                ) : (
                  <>
                    <span 
                      className="disc-filter-dot" 
                      style={{ background: status === 'online' ? '#22c55e' : status === 'away' ? '#f59e0b' : '#6b7280' }}
                    />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </>
                )}
                {status === 'online' && (
                  <span className="disc-filter-count">{onlineCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="disc-results">
          <div className="disc-results-header">
            <h2 className="disc-results-title">
              {searchQuery ? 'Search Results' : 'People'}
            </h2>
            <span className="disc-results-count">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>

          {loading ? (
            <div className="disc-empty">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <p className="disc-empty-title">Loading people…</p>
              </motion.div>
            </div>
          ) : loadError ? (
            <div className="disc-empty">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <p className="disc-empty-title">Could not load people</p>
                <p className="disc-empty-text">{loadError}</p>
              </motion.div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="disc-empty">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <p className="disc-empty-title">No users found</p>
                <p className="disc-empty-text">
                  {searchQuery 
                    ? `No results for "${searchQuery}"`
                    : 'Try adjusting your filters'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button 
                    className="disc-empty-reset"
                    onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="disc-grid">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <UserCard user={user} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
