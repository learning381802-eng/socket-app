// ProblemsTab.tsx
import { useState } from 'react'
import { useMathStore, DEFAULT_PROBLEMS, getAllProblems } from '../math/mathStore'
import MathRenderer from '../math/MathRenderer'

const DIFF_COLORS: Record<string, { bg: string; text: string }> = {
  easy:   { bg: '#e6f4ea', text: '#1e8e3e' },
  medium: { bg: '#fef7e0', text: '#e37400' },
  hard:   { bg: '#fce8e6', text: '#c5221f' },
}

export default function ProblemsTab() {
  const { forgeStats, theoriaStats, customProblems } = useMathStore()
  const [filter, setFilter] = useState<'all' | 'mathforge' | 'theoria'>('all')

  const allProblems = getAllProblems(customProblems)
  const seenAll = [
    ...forgeStats.allTimeSeenIds.map(id => ({ id, trainer: 'mathforge' as const })),
    ...theoriaStats.allTimeSeenIds.map(id => ({ id, trainer: 'theoria' as const })),
  ]

  const seen = seenAll.filter(({ trainer }) =>
    filter === 'all' || trainer === filter
  )

  const rows = seen.map(({ id, trainer }) => {
    const p = allProblems.find(p => p.id === id)
    return p ? { ...p, trainer } : null
  }).filter(Boolean)

  return (
    <div className="prb-root">
      {/* Filter pills */}
      <div className="prb-filter-row">
        {(['all', 'mathforge', 'theoria'] as const).map(f => (
          <button
            key={f}
            className={`prb-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'mathforge' ? '⚒ MathForge' : 'Θ Theoria'}
          </button>
        ))}
        <span className="prb-count">{rows.length} attempted</span>
      </div>

      {rows.length === 0 ? (
        <div className="prb-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
          </svg>
          <p>No problems attempted yet in this trainer.</p>
        </div>
      ) : (
        <div className="prb-list">
          {rows.map((p: any, i) => (
            <div className="prb-row" key={p.id + i}>
              <div className={`prb-trainer-dot ${p.trainer}`} />
              <div className="prb-body">
                <div className="prb-title-row">
                  <span className="prb-title">{p.title}</span>
                  <span className="prb-cat">{p.category}</span>
                </div>
                <div className="prb-formula">
                  <MathRenderer math={p.problem.slice(0, 60) + (p.problem.length > 60 ? '…' : '')} />
                </div>
              </div>
              <span
                className="prb-diff"
                style={{ background: DIFF_COLORS[p.difficulty]?.bg, color: DIFF_COLORS[p.difficulty]?.text }}
              >
                {p.difficulty}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
