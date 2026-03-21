import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import ChatLayout from './pages/ChatLayout'
import NotificationStack from './components/ui/NotificationStack'

export default function App() {
  const { user, setUser, setSession, theme } = useStore()

  useEffect(() => {
    // Initialize session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className={theme}>
      <div className="h-full" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Routes>
          <Route
            path="/auth"
            element={user ? <Navigate to="/" replace /> : <AuthPage />}
          />
          <Route
            path="/*"
            element={user ? <ChatLayout /> : <Navigate to="/auth" replace />}
          />
        </Routes>
        <NotificationStack />
      </div>
    </div>
  )
}
