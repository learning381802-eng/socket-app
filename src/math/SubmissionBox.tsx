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
  const { submitAnswer } = useMathStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    submitAnswer(problemId, answer)
    // Simulate answer checking (in real app, verify against solution)
    const isCorrect = answer.trim().length > 0
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) {
      setTimeout(onSolve, 500)
    }
  }

  return (
    <div className="submission-box">
      <form onSubmit={handleSubmit} className="submission-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setFeedback(null) }}
          placeholder="Enter your answer..."
          className="submission-input"
        />
        <button type="submit" className="submission-btn">
          Check
        </button>
      </form>
      {feedback && (
        <p className={`submission-feedback ${feedback}`}>
          {feedback === 'correct'
            ? '✓ Correct! Well done.'
            : '✗ Not quite. Try again.'}
        </p>
      )}
    </div>
  )
}
