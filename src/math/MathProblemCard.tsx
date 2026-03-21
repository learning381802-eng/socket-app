// MathProblemCard.tsx
import { useState } from 'react'
import MathRenderer from './MathRenderer'
import SubmissionBox from './SubmissionBox'
import { MathProblem } from './mathStore'

interface Props {
  problem: MathProblem
}

const difficultyColor: Record<string, string> = {
  easy: '#2d6a4f',
  medium: '#b5761a',
  hard: '#9b2226',
}

const difficultyBg: Record<string, string> = {
  easy: '#d8f3dc',
  medium: '#fff3cd',
  hard: '#fde8e8',
}

const categoryLabel: Record<string, string> = {
  algebra: 'Algebra',
  geometry: 'Geometry',
  calculus: 'Calculus',
}

export default function MathProblemCard({ problem }: Props) {
  const [showHint, setShowHint] = useState(false)
  const [solved, setSolved] = useState(false)

  return (
    <div className={`math-card ${solved ? 'math-card-solved' : ''}`}>
      <div className="math-card-header">
        <div className="math-card-meta">
          <span className="math-category-badge">
            {categoryLabel[problem.category]}
          </span>
          <span
            className="math-difficulty-badge"
            style={{
              color: difficultyColor[problem.difficulty],
              background: difficultyBg[problem.difficulty],
            }}
          >
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </span>
        </div>
        {solved && <span className="math-solved-badge">✓ Solved</span>}
      </div>

      <h3 className="math-card-title">{problem.title}</h3>

      <div className="math-problem-display">
        <MathRenderer math={problem.problem} block />
      </div>

      {problem.hint && (
        <div className="math-hint-section">
          <button
            className="math-hint-btn"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? '▼ Hide hint' : '▶ Show hint'}
          </button>
          {showHint && (
            <p className="math-hint-text">{problem.hint}</p>
          )}
        </div>
      )}

      <SubmissionBox
        problemId={problem.id}
        onSolve={() => setSolved(true)}
      />
    </div>
  )
}
