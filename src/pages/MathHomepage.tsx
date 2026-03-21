// MathHomepage.tsx - Public facing math website
import { useEffect } from 'react'
import { useStealthTransition } from '../hooks/useStealthTransition'
import HomepageHeader from '../math/HomepageHeader'
import CategoryFilter from '../math/CategoryFilter'
import ProblemFeed from '../math/ProblemFeed'

export default function MathHomepage() {
  const { isActivating } = useStealthTransition()

  return (
    <div
      className="math-site"
      style={{
        opacity: isActivating ? 0 : 1,
        transition: 'opacity 0.25s ease-out',
        pointerEvents: isActivating ? 'none' : 'all',
      }}
    >
      <HomepageHeader />
      <main className="math-main">
        <CategoryFilter />
        <ProblemFeed />
      </main>
      <footer className="math-footer">
        <div className="math-footer-inner">
          <p>© 2025 Socket Math. Free math education for everyone.</p>
          <div className="math-footer-links">
            <a href="#about">About</a>
            <a href="#problems">Problems</a>
            <a href="#categories">Topics</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
