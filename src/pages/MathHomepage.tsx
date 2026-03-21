// MathHomepage.tsx
import { useEffect, useState, lazy, Suspense } from 'react'
import { useStealthTransition } from '../hooks/useStealthTransition'
import HomepageHeader from '../math/HomepageHeader'
import AdminPanel from '../math/AdminPanel'
import { useStore } from '../store'

const MathForge = lazy(() => import('../math/MathForge'))
const Theoria = lazy(() => import('../math/Theoria'))

type ActiveTrainer = null | 'mathforge' | 'theoria'

export default function MathHomepage() {
  const { isActivating } = useStealthTransition()
  const { user } = useStore()
  const [activeTrainer, setActiveTrainer] = useState<ActiveTrainer>(null)

  useEffect(() => {
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    const root = document.getElementById('root')
    if (root) { root.style.overflow = 'auto'; root.style.height = 'auto' }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      const root = document.getElementById('root')
      if (root) { root.style.overflow = ''; root.style.height = '' }
    }
  }, [])

  const isAdmin = user && isMathAdmin(user.email)

  return (
    <div className="math-site" style={{
      opacity: isActivating ? 0 : 1,
      transition: 'opacity 0.25s ease-out',
      pointerEvents: isActivating ? 'none' : 'all',
    }}>
      <HomepageHeader />

      <main className="math-main">
        {isAdmin && <AdminPanel userEmail={user!.email!} />}

        {/* Trainer selection */}
        {!activeTrainer && <TrainerSelector onSelect={setActiveTrainer} />}

        {/* Active trainer */}
        {activeTrainer && (
          <div>
            <button className="back-btn" onClick={() => setActiveTrainer(null)}>
              ← Back to trainers
            </button>
            <Suspense fallback={<TrainerLoader />}>
              {activeTrainer === 'mathforge' && <MathForge />}
              {activeTrainer === 'theoria' && <Theoria />}
            </Suspense>
          </div>
        )}
      </main>

      <footer className="math-footer">
        <div className="math-footer-inner">
          <p>© 2025 Socket Math. Free math education for everyone.</p>
          <div className="math-footer-links">
            <a href="#">MathForge</a>
            <a href="#">Theoria</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TrainerSelector({ onSelect }: { onSelect: (t: 'mathforge' | 'theoria') => void }) {
  return (
    <div className="trainer-selector">
      <div className="trainer-selector-heading">
        <h2 className="section-heading">Choose your trainer</h2>
        <p className="trainer-selector-sub">Your progress is saved automatically. Level up as you improve.</p>
      </div>

      <div className="trainer-cards-grid">
        {/* MathForge card */}
        <button className="trainer-select-card forge-card" onClick={() => onSelect('mathforge')}>
          <div className="tsc-icon forge-icon">⚒</div>
          <div className="tsc-body">
            <h3 className="tsc-name">MathForge</h3>
            <p className="tsc-desc">
              Solve random problems across algebra, geometry, and calculus. Get harder challenges as your accuracy improves.
            </p>
            <div className="tsc-tags">
              <span className="tsc-tag">Algebra</span>
              <span className="tsc-tag">Geometry</span>
              <span className="tsc-tag">Calculus</span>
            </div>
          </div>
          <div className="tsc-cta forge-cta">Start training →</div>
        </button>

        {/* Theoria card */}
        <button className="trainer-select-card theoria-card" onClick={() => onSelect('theoria')}>
          <div className="tsc-icon theoria-icon">Θ</div>
          <div className="tsc-body">
            <h3 className="tsc-name">Theoria</h3>
            <p className="tsc-desc">
              Write proofs from scratch. Submit your reasoning, then compare against the model proof and self-assess.
            </p>
            <div className="tsc-tags">
              <span className="tsc-tag theoria-tag">Logic</span>
              <span className="tsc-tag theoria-tag">Proofs</span>
              <span className="tsc-tag theoria-tag">Reasoning</span>
            </div>
          </div>
          <div className="tsc-cta theoria-cta">Start proving →</div>
        </button>
      </div>
    </div>
  )
}

function TrainerLoader() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#888' }}>
      Loading trainer...
    </div>
  )
}

export function isMathAdmin(email?: string | null): boolean {
  if (!email) return false
  return getMathAdmins().some(a => a.email === email)
}

export function getMathAdmins(): { email: string; role: 'owner' | 'admin' }[] {
  const base = [{ email: 'jason38180202@gmail.com', role: 'owner' as const }]
  try {
    const extra = JSON.parse(localStorage.getItem('math_admins') || '[]')
    const all = [...base]
    for (const e of extra) {
      if (!all.find(a => a.email === e.email)) all.push(e)
    }
    return all
  } catch { return base }
}

export function addMathAdmin(email: string) {
  let admins: any[] = []
  try { admins = JSON.parse(localStorage.getItem('math_admins') || '[]') } catch {}
  if (!admins.find((a: any) => a.email === email)) {
    admins.push({ email, role: 'admin' })
    localStorage.setItem('math_admins', JSON.stringify(admins))
  }
}

export function removeMathAdmin(email: string) {
  if (email === 'jason38180202@gmail.com') return
  let admins: any[] = []
  try { admins = JSON.parse(localStorage.getItem('math_admins') || '[]') } catch {}
  localStorage.setItem('math_admins', JSON.stringify(admins.filter((a: any) => a.email !== email)))
}
