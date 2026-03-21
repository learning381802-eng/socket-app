// HomepageHeader.tsx
import SecretLink from './SecretLink'

export default function HomepageHeader() {
  return (
    <header className="math-header">
      <div className="math-header-inner">
        <div className="math-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#1a472a"/>
            <text x="14" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">∑</text>
          </svg>
          <span className="math-logo-text">Socket Math</span>
        </div>
        <nav className="math-nav">
          <a href="#problems">Problems</a>
          <a href="#categories">Topics</a>
          <a href="#about">About</a>
        </nav>
      </div>

      <div className="math-hero">
        <h1 className="math-title">
          Socket Math: Math for <SecretLink />
        </h1>
        <p className="math-subtitle">
          Practice problems across algebra, geometry, and calculus. Build your skills one problem at a time.
        </p>
        <div className="math-stats">
          <div className="math-stat">
            <span className="math-stat-num">500+</span>
            <span className="math-stat-label">Problems</span>
          </div>
          <div className="math-stat">
            <span className="math-stat-num">3</span>
            <span className="math-stat-label">Topics</span>
          </div>
          <div className="math-stat">
            <span className="math-stat-num">Free</span>
            <span className="math-stat-label">Always</span>
          </div>
        </div>
      </div>
    </header>
  )
}
