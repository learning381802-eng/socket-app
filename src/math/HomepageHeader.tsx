// HomepageHeader.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SecretLink from './SecretLink'
import MathLoginModal from './MathLoginModal'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../lib/supabase'

export default function HomepageHeader() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
  const initial = displayName[0]?.toUpperCase()

  return (
    <>
      <header className="math-header">
        <div className="math-header-inner">
          <div className="math-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1a472a"/>
              <text x="14" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">∑</text>
            </svg>
            <span className="math-logo-text">Socket Math</span>
          </div>

          <nav className="math-nav">
            <a href="#trainers">Trainers</a>
            <a href="#about">About</a>
          </nav>

          <div className="math-header-auth">
            {user ? (
              <div className="math-user-menu-wrap">
                <button
                  className="math-user-btn"
                  onClick={() => setShowUserMenu(v => !v)}
                >
                  <div className="math-user-avatar">{initial}</div>
                  <span className="math-user-name">{displayName}</span>
                  <span style={{ fontSize: 10, opacity: 0.5 }}>▼</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="math-menu-backdrop" onClick={() => setShowUserMenu(false)} />
                      <motion.div
                        className="math-user-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="math-dropdown-email">{user.email}</div>
                        <button
                          className="math-dropdown-item"
                          onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
                        >
                          View Profile
                        </button>
                <div className="math-dropdown-divider" />
                        <button
                          className="math-dropdown-item math-dropdown-signout"
                          onClick={() => { signOut(); setShowUserMenu(false) }}
                        >
                          Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                className="math-login-btn"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        <div className="math-hero">
          <h1 className="math-title">
            Socket Math: Math for <SecretLink />
          </h1>
          <p className="math-subtitle">
            Train with MathForge problems or prove theorems in Theoria.
            Level up as your accuracy improves.
          </p>
          <div className="math-stats">
            <div className="math-stat">
              <span className="math-stat-num">22</span>
              <span className="math-stat-label">Problems</span>
            </div>
            <div className="math-stat">
              <span className="math-stat-num">2</span>
              <span className="math-stat-label">Trainers</span>
            </div>
            <div className="math-stat">
              <span className="math-stat-num">Free</span>
              <span className="math-stat-label">Always</span>
            </div>
          </div>
        </div>
      </header>

      <MathLoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}
