// MathLoginModal.tsx — login/signup modal for the math homepage
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../lib/supabase'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MathLoginModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)

  const reset = () => {
    setEmail(''); setPassword(''); setName('')
    setError(''); setSuccess(''); setShowPass(false)
  }

  const handleClose = () => { reset(); onClose() }

  const handleSwitch = (m: 'signin' | 'signup') => {
    setMode(m); setError(''); setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
        handleClose()
      } else {
        const { error } = await signUpWithEmail(email, password, name)
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="math-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="math-modal-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="math-modal"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22 }}
            >
              {/* Header */}
              <div className="math-modal-header">
                <div>
                  <div className="math-modal-logo">
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="28" rx="6" fill="#1a472a"/>
                      <text x="14" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">∑</text>
                    </svg>
                    <span className="math-modal-logo-text">Socket Math</span>
                  </div>
                  <h2 className="math-modal-title">
                    {mode === 'signin' ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p className="math-modal-sub">
                    {mode === 'signin' ? 'Sign in to track your progress' : 'Start training for free'}
                  </p>
                </div>
                <button className="math-modal-close" onClick={handleClose}>✕</button>
              </div>

              {/* Mode tabs */}
              <div className="math-modal-tabs">
                <button
                  className={`math-modal-tab ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => handleSwitch('signin')}
                >Sign in</button>
                <button
                  className={`math-modal-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => handleSwitch('signup')}
                >Sign up</button>
              </div>

              <div className="math-modal-body">
                {/* Google */}
                <button className="math-google-btn" onClick={handleGoogle}>
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="math-modal-divider">
                  <span>or</span>
                </div>

                {/* Error / success */}
                <AnimatePresence>
                  {error && (
                    <motion.p className="math-modal-error"
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.p className="math-modal-success"
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {success}
                    </motion.p>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="math-modal-form">
                  {mode === 'signup' && (
                    <div className="math-field">
                      <label>Display name</label>
                      <input
                        type="text" value={name} required
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="math-input"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="math-field">
                    <label>Email</label>
                    <input
                      type="email" value={email} required
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="math-input"
                      autoFocus={mode === 'signin'}
                    />
                  </div>

                  <div className="math-field">
                    <label>Password</label>
                    <div className="math-input-wrap">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password} required
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="math-input math-input-pass"
                        minLength={6}
                      />
                      <button type="button" className="math-pass-toggle"
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="math-submit-btn" disabled={loading}>
                    {loading
                      ? <span className="math-spinner" />
                      : mode === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                </form>

                <p className="math-modal-switch">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button onClick={() => handleSwitch(mode === 'signin' ? 'signup' : 'signin')}>
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
