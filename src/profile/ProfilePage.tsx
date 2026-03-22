// ProfilePage.tsx — Main profile page
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from './ProfileHeader'
import InfoCard from './InfoCard'
import ActivityList from './ActivityList'
import ProfileTabs, { TabId } from './ProfileTabs'
import StatsPanel from './StatsPanel'
import ProblemsTab from './ProblemsTab'
import EditProfileModal from './EditProfileModal'
import { useStore } from '../store'

export default function ProfilePage() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('activity')
  const [editOpen, setEditOpen] = useState(false)

  // Allow scrolling on this page
  useEffect(() => {
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    const root = document.getElementById('root')
    if (root) { root.style.overflow = 'auto'; root.style.height = 'auto' }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      const root = document.getElementById('root')
      if (root) { root.style.overflow = ''; root.style.height = '' }
    }
  }, [])

  if (!user) {
    return (
      <div className="pp-gate">
        <p>Please sign in to view your profile.</p>
        <button className="pp-gate-btn" onClick={() => navigate('/')}>← Back to Socket Math</button>
      </div>
    )
  }

  return (
    <div className="pp-root">
      {/* Top nav bar */}
      <nav className="pp-nav">
        <button className="pp-nav-back" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Socket Math
        </button>
        <span className="pp-nav-title">Profile</span>
        <div style={{ width: 100 }} />
      </nav>

      {/* Page content */}
      <div className="pp-content">
        {/* Left column */}
        <div className="pp-left">
          <ProfileHeader onEditProfile={() => setEditOpen(true)} />
          <InfoCard />
        </div>

        {/* Right column */}
        <div className="pp-right">
          <div className="pp-card">
            <ProfileTabs active={tab} onChange={setTab} />
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="pp-tab-content"
              >
                {tab === 'activity' && <ActivityList />}
                {tab === 'problems' && <ProblemsTab />}
                {tab === 'stats'    && <StatsPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
