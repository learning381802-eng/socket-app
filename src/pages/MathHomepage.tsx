// MathHomepage.tsx - Public facing math website
import { useEffect } from 'react'
import { useStealthTransition } from '../hooks/useStealthTransition'
import HomepageHeader from '../math/HomepageHeader'
import CategoryFilter from '../math/CategoryFilter'
import ProblemFeed from '../math/ProblemFeed'
import AdminPanel from '../math/AdminPanel'
import { useStore } from '../store'

export default function MathHomepage() {
  const { isActivating } = useStealthTransition()
  const { user } = useStore()

  // Allow body to scroll on math page, lock it on chat
  useEffect(() => {
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    document.getElementById('root')!.style.overflow = 'auto'
    document.getElementById('root')!.style.height = 'auto'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.getElementById('root')!.style.overflow = ''
      document.getElementById('root')!.style.height = ''
    }
  }, [])

  const isOwnerOrAdmin = user && isMathAdmin(user.email)

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
        {isOwnerOrAdmin && <AdminPanel userEmail={user!.email!} />}
        <ProblemFeed />
      </main>
      <footer className="math-footer">
        <div className="math-footer-inner">
          <p>© 2025 Socket Math. Free math education for everyone.</p>
          <div className="math-footer-links">
            <a href="#problems">Problems</a>
            <a href="#categories">Topics</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Check if user is an owner or admin
export function isMathAdmin(email?: string | null): boolean {
  if (!email) return false
  const admins = getMathAdmins()
  return admins.some(a => a.email === email)
}

export function getMathAdmins(): { email: string; role: 'owner' | 'admin' }[] {
  const stored = localStorage.getItem('math_admins')
  const base: { email: string; role: 'owner' | 'admin' }[] = [
    { email: 'jason38180202@gmail.com', role: 'owner' }
  ]
  if (!stored) return base
  try {
    const extra = JSON.parse(stored)
    // Merge, avoiding duplicates
    const all = [...base]
    for (const e of extra) {
      if (!all.find(a => a.email === e.email)) all.push(e)
    }
    return all
  } catch {
    return base
  }
}

export function addMathAdmin(email: string): void {
  const current = getMathAdmins().filter(a => a.role !== 'owner')
  const existing = localStorage.getItem('math_admins')
  let admins: { email: string; role: 'owner' | 'admin' }[] = []
  try { admins = existing ? JSON.parse(existing) : [] } catch {}
  if (!admins.find(a => a.email === email)) {
    admins.push({ email, role: 'admin' })
    localStorage.setItem('math_admins', JSON.stringify(admins))
  }
}

export function removeMathAdmin(email: string): void {
  if (email === 'jason38180202@gmail.com') return // can't remove owner
  let admins: { email: string; role: 'owner' | 'admin' }[] = []
  try { admins = JSON.parse(localStorage.getItem('math_admins') || '[]') } catch {}
  admins = admins.filter(a => a.email !== email)
  localStorage.setItem('math_admins', JSON.stringify(admins))
}
