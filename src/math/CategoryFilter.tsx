// CategoryFilter.tsx
import { useMathStore, Category } from './mathStore'

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'all', label: 'All Topics', icon: '∞' },
  { id: 'algebra', label: 'Algebra', icon: 'x²' },
  { id: 'geometry', label: 'Geometry', icon: '△' },
  { id: 'calculus', label: 'Calculus', icon: '∫' },
]

export default function CategoryFilter() {
  const { activeCategory, setCategory } = useMathStore()

  return (
    <div className="category-filter" id="categories">
      <h2 className="section-heading">Browse by Topic</h2>
      <div className="category-pills">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
          >
            <span className="category-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
