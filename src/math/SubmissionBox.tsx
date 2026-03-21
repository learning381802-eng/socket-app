// SubmissionBox.tsx
import { useState } from 'react'
import { useMathStore } from './mathStore'

interface Props {
  problemId: string
  onSolve: () => void
}

export default function SubmissionBox({ problemId, onSolve }: Props) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [shake, setShake] = useState(false)
  const { submitAnswer } = useMathStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    submitAnswer(problemId, answer)
    const isCorrect = answer.trim().length > 0
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) {
      setTimeout(onSolve, 600)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const borderColor =
    feedback === 'correct' ? '#2d6a4f' :
    feedback === 'incorrect' ? '#c0392b' :
    '#dde8de'

  return (
    <div className="submission-box">
      <form onSubmit={handleSubmit}>
        {/* Input + button inside one box */}
        <div
          className={`submission-inner ${shake ? 'submission-shake' : ''}`}
          style={{ borderColor }}
        >
          <input
            type="text"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setFeedback(null) }}
            placeholder="Enter your answer..."
            className="submission-input"
          />
          <button
            type="submit"
            className="submission-check-btn"
            style={{
              background:
                feedback === 'correct' ? '#2d6a4f' :
                feedback === 'incorrect' ? '#c0392b' :
                '#1a472a',
            }}
          >
            {feedback === 'correct' ? '✓' : feedback === 'incorrect' ? '✕' : 'Check'}
          </button>
        </div>
      </form>

      {feedback && (
        <p className={`submission-feedback ${feedback}`}>
          {feedback === 'correct'
            ? '✓ Correct! Well done.'
            : '✗ Not quite — try again.'}
        </p>
      )}
    </div>
  )
}
