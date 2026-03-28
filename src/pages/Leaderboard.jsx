import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMathStore, accuracy } from '../math/mathStore'

export default function Leaderboard() {
  const navigate = useNavigate()
  const { forgeStats, theoriaStats } = useMathStore()

  const rows = useMemo(() => {
    const current = {
      name: 'You',
      points: forgeStats.points + theoriaStats.points,
      solved: forgeStats.correct + theoriaStats.correct,
      streak: Math.max(forgeStats.bestStreak, theoriaStats.bestStreak),
      acc: accuracy({ ...forgeStats, correct: forgeStats.correct + theoriaStats.correct, totalAnswered: forgeStats.totalAnswered + theoriaStats.totalAnswered }),
      badges: Array.from(new Set([...forgeStats.badges, ...theoriaStats.badges])),
    }
    const sample = [
      { name: 'EulerFan', points: 920, solved: 51, streak: 8, acc: 84, badges: ['5-day streak'] },
      { name: 'GeoNinja', points: 710, solved: 39, streak: 6, acc: 79, badges: ['Geometry Master'] },
      current,
    ]
    return sample.sort((a, b) => b.points - a.points)
  }, [forgeStats, theoriaStats])

  return (
    <div className="pp-root" style={{ padding: 24 }}>
      <button className="pp-nav-back" onClick={() => navigate('/profile')}>← Back to profile</button>
      <h1 style={{ fontSize: 30, margin: '16px 0' }}>Leaderboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ranked by points from solved problems.</p>
      <div className="pp-card" style={{ maxWidth: 900 }}>
        {rows.map((row, index) => (
          <div key={row.name} className="sp-topic-row" style={{ padding: '14px 8px', borderBottom: '1px solid var(--border)' }}>
            <strong style={{ width: 40 }}>#{index + 1}</strong>
            <strong style={{ minWidth: 160 }}>{row.name}</strong>
            <span>{row.points} pts</span>
            <span>{row.solved} solved</span>
            <span>{row.acc}% acc</span>
            <span>{row.streak} day streak</span>
            <span>{row.badges.join(', ') || 'No badges yet'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
