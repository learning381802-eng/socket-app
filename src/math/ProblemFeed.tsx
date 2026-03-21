// ProblemFeed.tsx
import { useMathStore, MATH_PROBLEMS } from './mathStore'
import MathProblemCard from './MathProblemCard'

export default function ProblemFeed() {
  const { activeCategory } = useMathStore()

  const filtered = activeCategory === 'all'
    ? MATH_PROBLEMS
    : MATH_PROBLEMS.filter((p) => p.category === activeCategory)

  return (
    <div className="problem-feed" id="problems">
      <div className="problem-feed-header">
        <h2 className="section-heading">
          {activeCategory === 'all' ? 'All Problems' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
        </h2>
        <span className="problem-count">{filtered.length} problems</span>
      </div>
      <div className="problem-grid">
        {filtered.map((problem) => (
          <MathProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </div>
  )
}
