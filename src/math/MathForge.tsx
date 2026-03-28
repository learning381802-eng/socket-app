import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MathRenderer from './MathRenderer'
import {
  useMathStore,
  pickNextProblem,
  getAllProblems,
  accuracy,
  levelToDifficulty,
  MathProblem,
  Category,
  recommendProblems,
} from './mathStore'
import { useStore } from '../store'
import { trackProblemSolve } from '../lib/supabase'

const CATS: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '∞' },
  { id: 'algebra', label: 'Algebra', icon: 'x²' },
  { id: 'geometry', label: 'Geometry', icon: '△' },
  { id: 'calculus', label: 'Calculus', icon: '∫' },
  { id: 'number-theory', label: 'Number Theory', icon: 'ℤ' },
]

function normalise(s: string) {
  return s.toLowerCase().replace(/\s+/g, '').replace(/,/g, '').trim()
}

export default function MathForge() {
  const { user } = useStore()
  const { customProblems, recordAnswer, markSeen, resetSeen } = useMathStore()
  const forgeStats = useMathStore(s => s.forgeStats)
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allProblems = useMemo(() => getAllProblems(customProblems), [customProblems])
  const forgeProblems = allProblems.filter(p => p.type === 'mathforge')
  const allTags = useMemo(() => Array.from(new Set(forgeProblems.flatMap(p => p.tags || []))).slice(0, 10), [forgeProblems])
  const filterCat = cat === 'all' ? undefined : cat

  const [current, setCurrent] = useState<MathProblem | null>(() =>
    pickNextProblem('mathforge', forgeStats, allProblems, filterCat, selectedTags, search)
  )
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [revealedHintCount, setRevealedHintCount] = useState(0)

  const recommendations = recommendProblems(allProblems.filter(p => p.type === 'mathforge'), forgeStats.solvedProblems, levelToDifficulty(forgeStats.level), 3)

  const pick = useCallback(() => {
    const s = useMathStore.getState()
    const fc = cat === 'all' ? undefined : cat
    const next = pickNextProblem('mathforge', s.forgeStats, getAllProblems(s.customProblems), fc, selectedTags, search)
    setCurrent(next)
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
    setRevealed(false)
    setRevealedHintCount(0)
  }, [cat, selectedTags, search])

  const onFiltersChanged = (nextCat: Category | 'all', nextTags = selectedTags, nextSearch = search) => {
    setCat(nextCat)
    const p = pickNextProblem('mathforge', useMathStore.getState().forgeStats, getAllProblems(useMathStore.getState().customProblems), nextCat === 'all' ? undefined : nextCat, nextTags, nextSearch)
    setCurrent(p)
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
    setRevealed(false)
    setRevealedHintCount(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || submitted || !answer.trim()) return
    markSeen('mathforge', current.id)
    const correct = current.answer ? normalise(answer) === normalise(current.answer) : true
    recordAnswer('mathforge', current, correct)
    if (correct && user?.id) {
      await trackProblemSolve(user.id, current.id, current.difficulty, current.tags || [])
    }
    setIsCorrect(correct)
    setSubmitted(true)
  }

  return (
    <div className="trainer-wrap">
      <div className="trainer-header forge-header">
        <div className="trainer-brand">
          <span className="trainer-icon forge-icon-char">⚒</span>
          <div>
            <h2 className="trainer-name">MathForge</h2>
            <p className="trainer-tagline">Try first mode + hints + step-by-step reveal</p>
          </div>
        </div>
        <div className="trainer-stats-row">
          <StatPill label="Level" value={`${forgeStats.level}`} accent="#2d6a4f" />
          <StatPill label="Accuracy" value={`${accuracy(forgeStats)}%`} accent="#185fa5" />
          <StatPill label="Points" value={`${forgeStats.points}`} accent="#6b3fa0" />
        </div>
      </div>

      <div className="problem-filters">
        <input className="problem-search" value={search} onChange={(e) => { setSearch(e.target.value); onFiltersChanged(cat, selectedTags, e.target.value) }} placeholder="Search problems by title or tags" />
        <div className="category-pills">
          {CATS.map(c => (
            <button key={c.id} onClick={() => onFiltersChanged(c.id)} className={`category-pill ${cat === c.id ? 'active' : ''}`}>
              <span className="category-icon">{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
        <div className="tag-filter-row">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`category-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => {
                const next = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
                setSelectedTags(next)
                onFiltersChanged(cat, next)
              }}
            >#{tag}</button>
          ))}
        </div>
      </div>

      {!current ? (
        <div className="trainer-empty"><h3>No problem matches these filters.</h3><button className="trainer-next-btn" onClick={() => { resetSeen('mathforge'); pick() }}>Reset</button></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="problem-card">
            <div className="pc-meta">
              <span className="math-category-badge" style={{ textTransform: 'capitalize' }}>{current.category}</span>
              <span className="math-difficulty-badge">{current.difficulty}</span>
              {(current.tags || []).map(tag => <span className="math-category-badge" key={tag}>#{tag}</span>)}
            </div>
            <h3 className="pc-title">{current.title}</h3>
            <div className="pc-problem-display"><MathRenderer math={current.problem} block /></div>

            <div className="try-first-box">
              <strong>Try First Mode</strong>
              <p>Work the problem yourself before revealing hints or the full solution.</p>
            </div>

            {!!current.hints?.length && (
              <div className="math-hint-section">
                <button className="math-hint-btn" onClick={() => setRevealedHintCount((h) => Math.min((current.hints || []).length, h + 1))}>Reveal next hint</button>
                {(current.hints || []).slice(0, revealedHintCount).map((hint, i) => (
                  <p key={i} className="math-hint-text">Hint {i + 1}: {hint}</p>
                ))}
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit}><div className="submission-inner"><input value={answer} onChange={e => setAnswer(e.target.value)} className="submission-input" placeholder="Enter your answer" /><button type="submit" className="submission-check-btn">Check</button></div></form>
            ) : (
              <div className={`pc-result-banner ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? 'Correct!' : `Not quite. Expected: ${current.answer || 'See solution below'}`}
              </div>
            )}

            <button className="trainer-next-btn" onClick={() => setRevealed(v => !v)}>{revealed ? 'Hide Step-by-Step Solution' : 'Reveal Step-by-Step Solution'}</button>
            {revealed && current.explanation && <div className="model-proof"><p className="model-proof-text">{current.explanation}</p></div>}

            {submitted && <button onClick={pick} className="trainer-next-btn">Next Problem →</button>}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="recommendation-card">
        <h4>Recommended for you</h4>
        {recommendations.map((p) => (
          <button key={p.id} className="rec-row" onClick={() => { setCurrent(p); setSubmitted(false); setAnswer(''); setRevealed(false); setRevealedHintCount(0) }}>
            <span>{p.title}</span><span>{p.difficulty}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StatPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <div className="stat-pill" style={{ borderColor: accent + '40' }}><span className="stat-pill-label">{label}</span><span className="stat-pill-value" style={{ color: accent }}>{value}</span></div>
}
