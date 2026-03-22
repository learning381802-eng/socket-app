// ProfileTabs.tsx
import { motion } from 'framer-motion'

export type TabId = 'activity' | 'problems' | 'stats'

interface Props {
  active: TabId
  onChange: (t: TabId) => void
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'problems', label: 'Problems' },
  { id: 'stats',    label: 'Stats'    },
]

export default function ProfileTabs({ active, onChange }: Props) {
  return (
    <div className="pt-root">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`pt-tab ${active === tab.id ? 'pt-tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {active === tab.id && (
            <motion.div
              className="pt-underline"
              layoutId="profile-tab-underline"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
