// SearchBar.tsx - Search input for filtering users
import { motion } from 'framer-motion'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search users...' }: Props) {
  return (
    <div className="sb-root">
      <motion.div
        className="sb-inner"
        initial={false}
        animate={{
          boxShadow: value ? '0 0 0 2px var(--accent), 0 2px 8px rgba(97,115,243,0.2)' : 'none',
        }}
        transition={{ duration: 0.15 }}
      >
        <svg className="sb-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          className="sb-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        {value && (
          <button className="sb-clear" onClick={() => onChange('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </motion.div>
    </div>
  )
}
