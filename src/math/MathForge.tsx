// MathForge.tsx — Problem trainer (self-contained, no TrainerCard)
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MathRenderer from './MathRenderer'
import {
  useMathStore, pickNextProblem, getAllProblems, accuracy,
  levelToDifficulty, MathProblem, Category,
} from './mathStore'

const DIFF_COLOR = { easy: '#2d6a4f', medium: '#b5761a', hard: '#9b2226' }
const DIFF_BG    = { easy: '#d8f3dc', medium: '#fff3cd', hard: '#fde8e8' }
const XP_NEEDED  = (lvl: number) => lvl * 100

const CATS: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all',      label: 'All',      icon: '∞'  },
  { id: 'algebra',  label: 'Algebra',  icon: 'x²' },
  { id: 'geometry', label: 'Geometry', icon: '△'  },
  { id: 'calculus', label: 'Calculus', icon: '∫'  },
]

function normalise(s: string) {
  return s.toLowerCase().replace(/\s+/g, '').replace(/,/g, '').trim()
}

export default function MathForge() {
  const { customProblems, recordAnswer, markSeen, resetSeen } = useMathStore()
  const forgeStats = useMathStore(s => s.forgeStats) // Reactive subscription
  const [cat, setCat] = useState<Category | 'all'>('all')

  const allProblems = getAllProblems(customProblems)
  const filterCat = cat === 'all' ? undefined : cat

  const [current, setCurrent] = useState<MathProblem | null>(() =>
    pickNextProblem('mathforge', forgeStats, allProblems, filterCat)
  )
  const [answer, setAnswer]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint]   = useState(false)
  const [showExpl, setShowExpl]   = useState(false)
  const [shake, setShake]         = useState(false)
  const [levelUp, setLevelUp]     = useState<number | null>(null)
  const [noMore, setNoMore]       = useState(!current)

  // Re-pick when category changes
  const handleCat = (c: Category | 'all') => {
    setCat(c)
    const fc = c === 'all' ? undefined : c
    const p = pickNextProblem('mathforge', useMathStore.getState().forgeStats, getAllProblems(useMathStore.getState().customProblems), fc)
    setCurrent(p)
    setAnswer(''); setSubmitted(false); setIsCorrect(false)
    setShowHint(false); setShowExpl(false)
    setNoMore(!p)
  }

  const advance = useCallback(() => {
    const s = useMathStore.getState()
    const fc = cat === 'all' ? undefined : (cat as Category)
    const next = pickNextProblem('mathforge', s.forgeStats, getAllProblems(s.customProblems), fc)
    setAnswer(''); setSubmitted(false); setIsCorrect(false)
    setShowHint(false); setShowExpl(false)
    if (!next) { setNoMore(true); return }
    setNoMore(false); setCurrent(next)
  }, [cat])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || submitted || !answer.trim()) return
    markSeen('mathforge', current.id)
    const prevLvl = useMathStore.getState().forgeStats.level
    const correct = current.answer ? normalise(answer) === normalise(current.answer) : true
    recordAnswer('mathforge', current.id, correct, current.difficulty)
    setIsCorrect(correct); setSubmitted(true)
    if (!correct) { setShake(true); setTimeout(() => setShake(false), 500) }
    else {
      const newLvl = useMathStore.getState().forgeStats.level
      if (newLvl > prevLvl) { setLevelUp(newLvl); setTimeout(() => setLevelUp(null), 2800) }
    }
  }

  const stats   = useMathStore(s => s.forgeStats)
  const acc     = accuracy(stats)
  const xpNeeded = XP_NEEDED(stats.level)
  const xpPct   = Math.min(100, Math.round((stats.xp / xpNeeded) * 100))
  const diff    = levelToDifficulty(stats.level)
  const unseenCount = allProblems
    .filter(p => p.type === 'mathforge' && !stats.allTimeSeenIds.includes(p.id)).length

  return (
    <div className="trainer-wrap">
      {/* Header */}
      <div className="trainer-header forge-header">
        <div className="trainer-brand">
          <span className="trainer-icon forge-icon-char">⚒</span>
          <div>
            <h2 className="trainer-name">MathForge</h2>
            <p className="trainer-tagline">Solve problems · earn XP · level up</p>
          </div>
        </div>
        <div className="trainer-stats-row">
          <StatPill label="Level"    value={`${stats.level}`}  accent="#2d6a4f" />
          <StatPill label="Streak"   value={`${stats.streak}🔥`} accent="#b5761a" />
          <StatPill label="Accuracy" value={`${acc}%`}         accent="#185fa5" />
          <StatPill label="Solved"   value={`${stats.correct}`} accent="#6173f3" />
        </div>
      </div>

      {/* XP bar */}
      <div className="xp-bar-wrap">
        <div className="xp-bar-track">
          <motion.div className="xp-bar-fill forge-xp" style={{ width: `${xpPct}%` }} layout />
        </div>
        <span className="xp-label">
          {stats.xp} / {xpNeeded} XP · targeting <strong>{diff}</strong> problems
          · <span style={{ color: '#888' }}>{unseenCount} unseen</span>
        </span>
      </div>

      {/* Category filter */}
      <div className="category-pills" style={{ marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => handleCat(c.id)}
            className={`category-pill ${cat === c.id ? 'active' : ''}`}>
            <span className="category-icon">{c.icon}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Level-up toast */}
      <AnimatePresence>
        {levelUp && (
          <motion.div className="levelup-toast forge-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}>
            🎉 Level {levelUp}! Harder problems unlocked.
          </motion.div>
        )}
      </AnimatePresence>

      {/* No more state */}
      {noMore ? (
        <div className="trainer-empty">
          <p className="trainer-empty-icon">⚒</p>
          <h3>You've seen every problem!</h3>
          <p>More will appear as new problems are added. Reset to replay.</p>
          <button className="trainer-next-btn" onClick={() => { resetSeen('mathforge'); advance() }}>
            ↺ Reset &amp; Start Over
          </button>
        </div>
      ) : !current ? (
        <div className="trainer-empty">
          <p className="trainer-empty-icon">⚒</p>
          <h3>No problems yet in this category</h3>
          <p>Switch category or ask the admin to add problems.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={current.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}
            className="problem-card">

            {/* Card header */}
            <div className="pc-header">
              <div className="pc-meta">
                <span className="math-category-badge" style={{ textTransform: 'capitalize' }}>
                  {current.category}
                </span>
                <span className="math-difficulty-badge"
                  style={{ color: DIFF_COLOR[current.difficulty], background: DIFF_BG[current.difficulty] }}>
                  {current.difficulty}
                </span>
              </div>
            </div>

            <h3 className="pc-title">{current.title}</h3>

            <div className="pc-problem-display">
              <MathRenderer math={current.problem} block />
            </div>

            {/* Hint */}
            {current.hint && (
              <div className="math-hint-section">
                <button className="math-hint-btn" onClick={() => setShowHint(!showHint)}>
                  {showHint ? '▼ Hide hint' : '▶ Show hint'}
                </button>
                {showHint && <p className="math-hint-text">{current.hint}</p>}
              </div>
            )}

            {/* Answer input */}
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div className={`submission-inner ${shake ? 'submission-shake' : ''}`}
                  style={{ borderColor: '#dde8de' }}>
                  <input type="text" value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="submission-input" autoComplete="off" />
                  <button type="submit" className="submission-check-btn"
                    style={{ background: '#1a472a' }}>
                    Check
                  </button>
                </div>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`pc-result-banner ${isCorrect ? 'correct' : 'incorrect'}`}>
                <span style={{ fontSize: 18, marginRight: 8 }}>{isCorrect ? '✓' : '✕'}</span>
                {isCorrect
                  ? `Correct! +${current.difficulty === 'easy' ? 10 : current.difficulty === 'medium' ? 20 : 35} XP`
                  : `Not quite — answer: ${current.answer}`}
                {current.explanation && (
                  <div style={{ marginTop: 8 }}>
                    <button className="math-hint-btn" style={{ color: isCorrect ? '#2d6a4f' : '#9b2226' }}
                      onClick={() => setShowExpl(!showExpl)}>
                      {showExpl ? '▼ Hide explanation' : '▶ Show explanation'}
                    </button>
                    {showExpl && <p className="math-hint-text" style={{ marginTop: 6 }}>{current.explanation}</p>}
                  </div>
                )}
              </motion.div>
            )}

            {submitted && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={advance} className="trainer-next-btn">
                Next Problem →
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

function StatPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="stat-pill" style={{ borderColor: accent + '40' }}>
      <span className="stat-pill-label">{label}</span>
      <span className="stat-pill-value" style={{ color: accent }}>{value}</span>
    </div>
  )
}
