// Theoria.tsx — Proof trainer (self-contained)
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MathRenderer from './MathRenderer'
import {
  useMathStore, pickNextProblem, getAllProblems, accuracy,
  levelToDifficulty, MathProblem, DEFAULT_PROBLEMS,
} from './mathStore'

const XP_NEEDED = (lvl: number) => lvl * 100

export default function Theoria() {
  const { customProblems, theoriaStats, recordAnswer, markSeen, resetSeen } = useMathStore()
  const allProblems = getAllProblems(customProblems)

  const [current, setCurrent] = useState<MathProblem | null>(() =>
    pickNextProblem('theoria', theoriaStats, allProblems, 'proof')
  )
  const [proofText, setProofText]   = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [revealed, setRevealed]     = useState(false)
  const [selfScore, setSelfScore]   = useState<'correct' | 'partial' | 'incorrect' | null>(null)
  const [showHint, setShowHint]     = useState(false)
  const [levelUp, setLevelUp]       = useState<number | null>(null)
  const [noMore, setNoMore]         = useState(!current)

  const advance = useCallback(() => {
    const s = useMathStore.getState()
    const next = pickNextProblem('theoria', s.theoriaStats, getAllProblems(s.customProblems), 'proof')
    setProofText(''); setSubmitted(false); setRevealed(false)
    setSelfScore(null); setShowHint(false)
    if (!next) { setNoMore(true); return }
    setNoMore(false); setCurrent(next)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofText.trim() || submitted) return
    markSeen('theoria', current!.id)
    setSubmitted(true)
    setRevealed(true)
  }

  const handleSkip = () => {
    if (!current) return
    markSeen('theoria', current.id)
    setSubmitted(true)
    setRevealed(true)
  }

  const handleSelfScore = (score: 'correct' | 'partial' | 'incorrect') => {
    setSelfScore(score)
    const prevLvl = useMathStore.getState().theoriaStats.level
    recordAnswer('theoria', current!.id, score === 'correct', current!.difficulty)
    const newLvl = useMathStore.getState().theoriaStats.level
    if (newLvl > prevLvl) { setLevelUp(newLvl); setTimeout(() => setLevelUp(null), 2800) }
  }

  const stats    = useMathStore(s => s.theoriaStats)
  const acc      = accuracy(stats)
  const xpNeeded = XP_NEEDED(stats.level)
  const xpPct    = Math.min(100, Math.round((stats.xp / xpNeeded) * 100))
  const diff     = levelToDifficulty(stats.level)
  const unseenCount = allProblems
    .filter(p => p.type === 'theoria' && !stats.allTimeSeenIds.includes(p.id)).length

  return (
    <div className="trainer-wrap">
      {/* Header */}
      <div className="trainer-header theoria-header">
        <div className="trainer-brand">
          <span className="trainer-icon theoria-icon-char">Θ</span>
          <div>
            <h2 className="trainer-name">Theoria</h2>
            <p className="trainer-tagline">Write proofs · reason from first principles</p>
          </div>
        </div>
        <div className="trainer-stats-row">
          <StatPill label="Level"   value={`${stats.level}`}    accent="#185fa5" />
          <StatPill label="Streak"  value={`${stats.streak}🔥`} accent="#b5761a" />
          <StatPill label="Accuracy" value={`${acc}%`}          accent="#6b3fa0" />
          <StatPill label="Proved"  value={`${stats.correct}`}  accent="#6173f3" />
        </div>
      </div>

      {/* XP bar */}
      <div className="xp-bar-wrap">
        <div className="xp-bar-track">
          <motion.div className="xp-bar-fill theoria-xp" style={{ width: `${xpPct}%` }} layout />
        </div>
        <span className="xp-label">
          {stats.xp} / {xpNeeded} XP · targeting <strong>{diff}</strong> proofs
          · <span style={{ color: '#888' }}>{unseenCount} unseen</span>
        </span>
      </div>

      {/* How it works */}
      <div className="theoria-info">
        <strong>How it works:</strong> Write your proof in plain language or symbols,
        then reveal the model proof and self-assess to earn XP.
      </div>

      {/* Level-up toast */}
      <AnimatePresence>
        {levelUp && (
          <motion.div className="levelup-toast theoria-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}>
            🎉 Level {levelUp}! Harder proofs unlocked.
          </motion.div>
        )}
      </AnimatePresence>

      {/* No more state */}
      {noMore ? (
        <div className="trainer-empty">
          <p className="trainer-empty-icon">Θ</p>
          <h3>You've proved everything!</h3>
          <p>More proofs will appear as the admin adds them. Reset to replay.</p>
          <button className="trainer-next-btn" onClick={() => { resetSeen('theoria'); advance() }}>
            ↺ Reset &amp; Start Over
          </button>
        </div>
      ) : !current ? (
        <div className="trainer-empty">
          <p className="trainer-empty-icon">Θ</p>
          <h3>No proofs available yet</h3>
          <p>Ask the admin to add proof problems.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={current.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}
            className="problem-card theoria-card">

            {/* Card header */}
            <div className="pc-header">
              <div className="pc-meta">
                <span className="pc-cat theoria-cat">proof</span>
                <span className={`math-difficulty-badge diff-badge-${current.difficulty}`}
                  style={{
                    color: current.difficulty === 'easy' ? '#2d6a4f' : current.difficulty === 'medium' ? '#b5761a' : '#9b2226',
                    background: current.difficulty === 'easy' ? '#d8f3dc' : current.difficulty === 'medium' ? '#fff3cd' : '#fde8e8',
                  }}>
                  {current.difficulty}
                </span>
              </div>
              <span className="pc-unseen">{unseenCount} unseen</span>
            </div>

            <h3 className="pc-title">{current.title}</h3>

            <div className="pc-problem-display theoria-display">
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

            {/* Proof input */}
            {!submitted && (
              <form onSubmit={handleSubmit} className="proof-form">
                <label className="proof-label">Your proof:</label>
                <textarea
                  value={proofText}
                  onChange={e => setProofText(e.target.value)}
                  placeholder="Write your proof here — plain language, logic symbols, or LaTeX..."
                  className="proof-textarea"
                  rows={5}
                />
                <div className="proof-actions">
                  <button type="submit" disabled={!proofText.trim()}
                    className="trainer-next-btn" style={{ opacity: proofText.trim() ? 1 : 0.4 }}>
                    Submit proof
                  </button>
                  <button type="button" onClick={handleSkip} className="pc-skip-btn">
                    Skip &amp; reveal
                  </button>
                </div>
              </form>
            )}

            {/* Submitted proof */}
            {submitted && proofText && (
              <div className="proof-submitted">
                <p className="proof-submitted-label">Your proof:</p>
                <p className="proof-submitted-text">{proofText}</p>
              </div>
            )}

            {/* Model proof */}
            {revealed && current.explanation && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="model-proof">
                <p className="model-proof-label">Model proof:</p>
                <p className="model-proof-text">{current.explanation}</p>
              </motion.div>
            )}

            {/* Self-assess */}
            {revealed && !selfScore && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="self-assess">
                <p className="self-assess-label">How well did you do?</p>
                <div className="self-assess-btns">
                  <button onClick={() => handleSelfScore('correct')}   className="sa-btn sa-correct">✓ Got it</button>
                  <button onClick={() => handleSelfScore('partial')}   className="sa-btn sa-partial">~ Partial</button>
                  <button onClick={() => handleSelfScore('incorrect')} className="sa-btn sa-incorrect">✕ Missed it</button>
                </div>
              </motion.div>
            )}

            {/* Score result */}
            {selfScore && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={`pc-result-banner ${selfScore === 'correct' ? 'correct' : selfScore === 'partial' ? 'partial' : 'incorrect'}`}>
                  {selfScore === 'correct'   && '✓ Great proof! XP awarded.'}
                  {selfScore === 'partial'   && '~ Partial — keep practicing.'}
                  {selfScore === 'incorrect' && '✕ Review the model proof carefully.'}
                </div>
              </motion.div>
            )}

            {selfScore && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={advance} className="trainer-next-btn" style={{ marginTop: 16 }}>
                Next Proof →
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
