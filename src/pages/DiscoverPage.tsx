// DiscoverPage.tsx - Find people to chat with
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MOCK_USERS } from '../data/users'
import UserCard from '../components/UserCard'
import SearchBar from '../components/SearchBar'

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'idle' | 'offline'>('all')

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const onlineCount = MOCK_USERS.filter(u => u.status === 'online').length

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
            {(['all', 'online', 'idle', 'offline'] as const).map((status) => (
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
                      style={{ background: status === 'online' ? '#22c55e' : status === 'idle' ? '#f59e0b' : '#6b7280' }}
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
              {searchQuery ? 'Search Results' : 'All Users'}
            </h2>
            <span className="disc-results-count">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>

          {filteredUsers.length === 0 ? (
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
