import { useEffect, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import { supabase } from './lib/supabase'
import MathHomepage from './pages/MathHomepage'
import StealthRouteGuard from './stealth/stealthRouteGuard'
import { ModuleCore, StreamAuth } from './stealth/lazyLoader'
import NotificationStack from './components/ui/NotificationStack'
import ProfilePage from './profile/ProfilePage'
import DiscoverPage from './pages/DiscoverPage'
import Leaderboard from './pages/Leaderboard'

function ChatLoader() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#13162a',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '3px solid #2a2f4a',
        borderTopColor: '#6173f3',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  const { user, setUser, setSession, theme } = useStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className={theme} style={{ height: "100%" }}>
      {/* Public math homepage */}
      <Routes>
        <Route path="/" element={<MathHomepage />} />

        {/* Hidden chat — only accessible after "everyone" trigger */}
        <Route
          path="/socket/*"
          element={
            <StealthRouteGuard>
              <Suspense fallback={<ChatLoader />}>
                <div style={{ height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  {user ? <ModuleCore /> : <StreamAuth />}
                </div>
              </Suspense>
            </StealthRouteGuard>
          }
        />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <NotificationStack />
    </div>
  )
}
