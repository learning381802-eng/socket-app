// ActivityList.tsx
import { useMathStore, DEFAULT_PROBLEMS } from '../math/mathStore'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  icon: string
  title: string
  preview: string
  time: string
  trainer: 'mathforge' | 'theoria'
}

function buildActivity(seenIds: string[], trainer: 'mathforge' | 'theoria'): ActivityItem[] {
  return seenIds
    .slice()
    .reverse()
    .slice(0, 8)
    .map((id, i) => {
      const p = DEFAULT_PROBLEMS.find((p) => p.id === id)
      const title = p ? p.title : 'Custom Problem'
      const cat = p ? p.category : 'math'
      const diff = p ? p.difficulty : 'medium'
      return {
        id: id + i,
        icon: trainer === 'mathforge' ? '⚒' : 'Θ',
        title: trainer === 'mathforge' ? `Solved: ${title}` : `Proved: ${title}`,
        preview: `${cat.charAt(0).toUpperCase() + cat.slice(1)} · ${diff}`,
        time: `${(i + 1) * 3}m ago`,
        trainer,
      }
    })
}

export default function ActivityList() {
  const { forgeStats, theoriaStats } = useMathStore()

  const forgeActivity  = buildActivity(forgeStats.allTimeSeenIds,   'mathforge')
  const theoriaActivity = buildActivity(theoriaStats.allTimeSeenIds, 'theoria')

  const combined = [...forgeActivity, ...theoriaActivity]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)

  if (combined.length === 0) {
    return (
      <div className="al-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
        <p>No activity yet — start practicing!</p>
      </div>
    )
  }

  return (
    <div className="al-root">
      {combined.map((item) => (
        <div className="al-row" key={item.id}>
          <div className={`al-icon ${item.trainer === 'mathforge' ? 'al-icon-forge' : 'al-icon-theoria'}`}>
            {item.icon}
          </div>
          <div className="al-body">
            <p className="al-title">{item.title}</p>
            <p className="al-preview">{item.preview}</p>
          </div>
          <span className="al-time">{item.time}</span>
        </div>
      ))}
    </div>
  )
}
