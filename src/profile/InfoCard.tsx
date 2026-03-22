// InfoCard.tsx
import { useMathStore, accuracy } from '../math/mathStore'

export default function InfoCard() {
  const { forgeStats, theoriaStats } = useMathStore()

  const totalSolved   = forgeStats.correct + theoriaStats.correct
  const totalAnswered = forgeStats.totalAnswered + theoriaStats.totalAnswered
  const combinedAcc   = totalAnswered === 0 ? 0 : Math.round((totalSolved / totalAnswered) * 100)
  const bestStreak    = Math.max(forgeStats.streak, theoriaStats.streak)
  const forgeLevel    = forgeStats.level
  const theoriaLevel  = theoriaStats.level

  const stats = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
      label: 'Problems Solved',
      value: totalSolved.toString(),
      accent: '#1a73e8',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      label: 'Accuracy',
      value: `${combinedAcc}%`,
      accent: '#1e8e3e',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      label: 'Best Streak',
      value: `${bestStreak} 🔥`,
      accent: '#e37400',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      label: 'MathForge Level',
      value: `Lv ${forgeLevel}`,
      accent: '#2d6a4f',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      label: 'Theoria Level',
      value: `Lv ${theoriaLevel}`,
      accent: '#185fa5',
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      label: 'Total Attempts',
      value: totalAnswered.toString(),
      accent: '#6b3fa0',
    },
  ]

  return (
    <div className="ic-root">
      <div className="ic-bio">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80868b" strokeWidth="2">
          <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/>
        </svg>
        <span>Socket Math learner · practicing daily</span>
      </div>
      <div className="ic-grid">
        {stats.map((s) => (
          <div className="ic-stat" key={s.label}>
            <span className="ic-stat-icon" style={{ color: s.accent }}>{s.icon}</span>
            <div className="ic-stat-body">
              <span className="ic-stat-value" style={{ color: s.accent }}>{s.value}</span>
              <span className="ic-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
