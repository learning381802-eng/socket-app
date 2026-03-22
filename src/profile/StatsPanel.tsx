// StatsPanel.tsx
import { motion } from 'framer-motion'
import { useMathStore, accuracy, levelToDifficulty, DEFAULT_PROBLEMS } from '../math/mathStore'

export default function StatsPanel() {
  const { forgeStats, theoriaStats } = useMathStore()

  const forgeAcc   = accuracy(forgeStats)
  const theoriaAcc = accuracy(theoriaStats)
  const forgeXpPct = Math.min(100, Math.round((forgeStats.xp / (forgeStats.level * 100)) * 100))
  const theoriaXpPct = Math.min(100, Math.round((theoriaStats.xp / (theoriaStats.level * 100)) * 100))

  // Topic breakdown from seen problems
  const catCounts: Record<string, number> = { algebra: 0, geometry: 0, calculus: 0, proof: 0 }
  forgeStats.allTimeSeenIds.forEach((id) => {
    const p = DEFAULT_PROBLEMS.find((p) => p.id === id)
    if (p) catCounts[p.category] = (catCounts[p.category] || 0) + 1
  })
  theoriaStats.allTimeSeenIds.forEach((id) => {
    const p = DEFAULT_PROBLEMS.find((p) => p.id === id)
    if (p) catCounts[p.category] = (catCounts[p.category] || 0) + 1
  })

  const totalCat = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1

  const categories = [
    { key: 'algebra',  label: 'Algebra',  color: '#1a73e8' },
    { key: 'geometry', label: 'Geometry', color: '#1e8e3e' },
    { key: 'calculus', label: 'Calculus', color: '#e37400' },
    { key: 'proof',    label: 'Proofs',   color: '#6b3fa0' },
  ]

  // Simulated weekly activity (last 7 days)
  const totalSolved = forgeStats.correct + theoriaStats.correct
  const weekBars = generateWeekBars(totalSolved)

  return (
    <div className="sp-root">
      {/* Trainer comparison */}
      <section className="sp-section">
        <h3 className="sp-section-title">Trainer Progress</h3>
        <div className="sp-trainers">
          <TrainerStat
            label="MathForge"
            icon="⚒"
            level={forgeStats.level}
            xpPct={forgeXpPct}
            xp={forgeStats.xp}
            xpNeeded={forgeStats.level * 100}
            correct={forgeStats.correct}
            total={forgeStats.totalAnswered}
            acc={forgeAcc}
            streak={forgeStats.streak}
            color="#2d6a4f"
          />
          <TrainerStat
            label="Theoria"
            icon="Θ"
            level={theoriaStats.level}
            xpPct={theoriaXpPct}
            xp={theoriaStats.xp}
            xpNeeded={theoriaStats.level * 100}
            correct={theoriaStats.correct}
            total={theoriaStats.totalAnswered}
            acc={theoriaAcc}
            streak={theoriaStats.streak}
            color="#185fa5"
          />
        </div>
      </section>

      {/* Weekly activity bar chart */}
      <section className="sp-section">
        <h3 className="sp-section-title">Weekly Activity</h3>
        <div className="sp-chart">
          {weekBars.map((bar, i) => (
            <div className="sp-bar-col" key={i}>
              <div className="sp-bar-track">
                <motion.div
                  className="sp-bar-fill"
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.pct}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  title={`${bar.count} solved`}
                />
              </div>
              <span className="sp-bar-label">{bar.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Topic breakdown */}
      <section className="sp-section">
        <h3 className="sp-section-title">Topic Breakdown</h3>
        <div className="sp-topics">
          {categories.map((cat) => {
            const count = catCounts[cat.key] || 0
            const pct = Math.round((count / totalCat) * 100)
            return (
              <div className="sp-topic-row" key={cat.key}>
                <span className="sp-topic-label">{cat.label}</span>
                <div className="sp-topic-bar-track">
                  <motion.div
                    className="sp-topic-bar-fill"
                    style={{ background: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="sp-topic-count">{count}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Difficulty breakdown */}
      <section className="sp-section">
        <h3 className="sp-section-title">Current Difficulty Targets</h3>
        <div className="sp-diff-row">
          <DiffChip label="MathForge" diff={levelToDifficulty(forgeStats.level)} />
          <DiffChip label="Theoria"   diff={levelToDifficulty(theoriaStats.level)} />
        </div>
      </section>
    </div>
  )
}

function TrainerStat({ label, icon, level, xpPct, xp, xpNeeded, correct, total, acc, streak, color }: any) {
  return (
    <div className="sp-trainer-card" style={{ borderTopColor: color }}>
      <div className="sp-trainer-head">
        <span className="sp-trainer-icon" style={{ background: color + '18', color }}>{icon}</span>
        <div>
          <p className="sp-trainer-name">{label}</p>
          <p className="sp-trainer-level" style={{ color }}>Level {level}</p>
        </div>
      </div>
      <div className="sp-trainer-xpbar">
        <motion.div className="sp-trainer-xpfill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${xpPct}%` }}
          transition={{ duration: 0.5 }} />
      </div>
      <p className="sp-trainer-xp-label">{xp} / {xpNeeded} XP</p>
      <div className="sp-trainer-stats">
        <MiniStat label="Solved" value={correct} />
        <MiniStat label="Accuracy" value={`${acc}%`} />
        <MiniStat label="Streak" value={`${streak}🔥`} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="sp-mini-stat">
      <span className="sp-mini-val">{value}</span>
      <span className="sp-mini-label">{label}</span>
    </div>
  )
}

function DiffChip({ label, diff }: { label: string; diff: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    easy:   { bg: '#e6f4ea', text: '#1e8e3e' },
    medium: { bg: '#fef7e0', text: '#e37400' },
    hard:   { bg: '#fce8e6', text: '#c5221f' },
  }
  const c = colors[diff] || colors.easy
  return (
    <div className="sp-diff-chip">
      <span className="sp-diff-label">{label}</span>
      <span className="sp-diff-badge" style={{ background: c.bg, color: c.text }}>
        {diff}
      </span>
    </div>
  )
}

function generateWeekBars(totalSolved: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()
  const weights = [0.1, 0.2, 0.15, 0.25, 0.1, 0.08, 0.12]
  const counts = days.map((_, i) => {
    const dayIdx = (i + 1) % 7
    const isPast = dayIdx <= today
    return isPast ? Math.round(totalSolved * weights[i]) : 0
  })
  const max = Math.max(...counts, 1)
  return days.map((day, i) => ({
    day,
    count: counts[i],
    pct: Math.round((counts[i] / max) * 100),
  }))
}
