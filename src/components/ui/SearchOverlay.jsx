import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MessageSquare, Hash, User, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../../store'
import { searchMessages, searchUsers, supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'
import { useNavigate } from 'react-router-dom'

export default function SearchOverlay() {
  const { setSearchOpen, user, setActiveConversation, conversations } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ messages: [], users: [], conversations: [] })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ messages: [], users: [], conversations: [] })
      return
    }
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const doSearch = async (q) => {
    setLoading(true)
    try {
      // Use RPC function for better user search
      let { data: userData } = await supabase.rpc('search_users_by_query', { search_query: q })
      if (!userData) {
        // Fallback to direct query
        const userRes = await searchUsers(q)
        userData = userRes.data
      }
      
      const [msgRes] = await Promise.all([
        searchMessages(q, user?.id),
      ])
      
      const convMatches = conversations.filter((c) =>
        c.name?.toLowerCase().includes(q.toLowerCase())
      )
      
      setResults({
        messages: msgRes.data || [],
        users: (userData || []).filter((u) => u.id !== user?.id),
        conversations: convMatches,
      })
    } catch (err) {
      console.error('Search error:', err)
      setResults({ messages: [], users: [], conversations: [] })
    }
    setLoading(false)
  }

  const goToConversation = (conv) => {
    setActiveConversation(conv)
    const prefix = conv.type === 'space' ? 'space' : conv.type === 'group' ? 'group' : 'dm'
    navigate(`/${prefix}/${conv.id}`)
    setSearchOpen(false)
  }

  const hasResults =
    results.messages.length > 0 ||
    results.users.length > 0 ||
    results.conversations.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-panel"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          {loading ? (
            <div className="w-5 h-5 border-2 rounded-full animate-spin shrink-0"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          ) : (
            <Search size={18} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, people, spaces..."
            className="flex-1 bg-transparent text-base outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
            <kbd className="text-xs px-2 py-1 rounded-lg font-mono"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {!query && (
            <div className="p-6 text-center">
              <Search size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Search across all your messages, people, and spaces
              </p>
            </div>
          )}

          {query && !hasResults && !loading && (
            <div className="p-8 text-center">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                No results for "{query}"
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Try different keywords or check the spelling
              </p>
            </div>
          )}

          {results.conversations.length > 0 && (
            <ResultSection title="Spaces & Chats">
              {results.conversations.map((conv) => (
                <SearchResult
                  key={conv.id}
                  icon={conv.type === 'space'
                    ? <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>#</div>
                    : <Avatar name={conv.name} size={36} />
                  }
                  title={conv.name}
                  subtitle={conv.type === 'space' ? 'Space' : 'Direct message'}
                  onClick={() => goToConversation(conv)}
                />
              ))}
            </ResultSection>
          )}

          {results.users.length > 0 && (
            <ResultSection title="People">
              {results.users.map((u) => (
                <SearchResult
                  key={u.id}
                  icon={<Avatar name={u.display_name} size={36} src={u.avatar_url} />}
                  title={u.display_name}
                  subtitle={u.email}
                  onClick={() => setSearchOpen(false)}
                />
              ))}
            </ResultSection>
          )}

          {results.messages.length > 0 && (
            <ResultSection title="Messages">
              {results.messages.map((msg) => (
                <SearchResult
                  key={msg.id}
                  icon={<Avatar name={msg.users?.display_name} size={36} />}
                  title={msg.users?.display_name || 'Unknown'}
                  subtitle={typeof msg.content === 'string' ? msg.content.slice(0, 80) : ''}
                  meta={msg.created_at ? format(new Date(msg.created_at), 'MMM d') : ''}
                  onClick={() => {
                    const conv = conversations.find((c) => c.id === msg.conversation_id)
                    if (conv) goToConversation(conv)
                  }}
                />
              ))}
            </ResultSection>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { key: '↑↓', label: 'Navigate' },
            { key: '↵', label: 'Open' },
            { key: 'ESC', label: 'Close' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd className="text-[11px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {key}
              </kbd>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ResultSection({ title, children }) {
  return (
    <div>
      <div className="px-5 py-2 sticky top-0" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

function SearchResult({ icon, title, subtitle, meta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left"
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {subtitle && (
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {meta && <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{meta}</span>}
    </button>
  )
}
