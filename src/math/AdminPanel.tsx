// AdminPanel.tsx
import { useState } from 'react'
import { useMathStore } from './mathStore'
import { getMathAdmins, addMathAdmin, removeMathAdmin, isMathAdmin } from '../pages/MathHomepage'
import { Category } from './mathStore'

interface Props {
  userEmail: string
}

const isOwner = (email: string) => email === 'jason38180202@gmail.com'

export default function AdminPanel({ userEmail }: Props) {
  const [tab, setTab] = useState<'problems' | 'admins'>('problems')
  const [open, setOpen] = useState(false)
  const { addProblem, customProblems, deleteProblem } = useMathStore()
  const [admins, setAdmins] = useState(getMathAdmins)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')

  // Problem form state
  const [form, setForm] = useState({
    title: '',
    problem: '',
    category: 'algebra' as Category,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    hint: '',
  })
  const [formMsg, setFormMsg] = useState('')

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.problem.trim()) {
      setFormMsg('Title and problem are required.')
      return
    }
    addProblem({ ...form, addedBy: userEmail })
    setForm({ title: '', problem: '', category: 'algebra', difficulty: 'easy', hint: '' })
    setFormMsg('✓ Problem added!')
    setTimeout(() => setFormMsg(''), 3000)
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setAdminMsg('Enter a valid email.')
      return
    }
    if (admins.find(a => a.email === newAdminEmail)) {
      setAdminMsg('That person is already an admin.')
      return
    }
    addMathAdmin(newAdminEmail.trim())
    setAdmins(getMathAdmins())
    setNewAdminEmail('')
    setAdminMsg('✓ Admin added!')
    setTimeout(() => setAdminMsg(''), 3000)
  }

  const handleRemoveAdmin = (email: string) => {
    removeMathAdmin(email)
    setAdmins(getMathAdmins())
  }

  return (
    <div className="admin-panel">
      <button className="admin-toggle" onClick={() => setOpen(!open)}>
        {open ? '▼' : '▶'} Admin Panel
        <span className="admin-badge">{isOwner(userEmail) ? 'Owner' : 'Admin'}</span>
      </button>

      {open && (
        <div className="admin-body">
          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${tab === 'problems' ? 'active' : ''}`}
              onClick={() => setTab('problems')}
            >
              ＋ Add Problem
            </button>
            {isOwner(userEmail) && (
              <button
                className={`admin-tab ${tab === 'admins' ? 'active' : ''}`}
                onClick={() => setTab('admins')}
              >
                👥 Manage Admins
              </button>
            )}
          </div>

          {/* Add problem tab */}
          {tab === 'problems' && (
            <div className="admin-section">
              <form onSubmit={handleAddProblem} className="admin-form">
                <div className="admin-row">
                  <div className="admin-field">
                    <label>Problem Title *</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Quadratic Formula"
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                      className="admin-input"
                    >
                      <option value="algebra">Algebra</option>
                      <option value="geometry">Geometry</option>
                      <option value="calculus">Calculus</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as any }))}
                      className="admin-input"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="admin-field">
                  <label>LaTeX Problem *</label>
                  <input
                    value={form.problem}
                    onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
                    placeholder="e.g. x^2 + 5x + 6 = 0"
                    className="admin-input admin-input-wide"
                  />
                  <p className="admin-hint-text">Use LaTeX notation: x^2, \frac{"{a}{b}"}, \sqrt{"{x}"}, \int, etc.</p>
                </div>
                <div className="admin-field">
                  <label>Hint (optional)</label>
                  <input
                    value={form.hint}
                    onChange={e => setForm(f => ({ ...f, hint: e.target.value }))}
                    placeholder="A helpful hint for students..."
                    className="admin-input admin-input-wide"
                  />
                </div>
                <div className="admin-actions">
                  <button type="submit" className="admin-btn-primary">Add Problem</button>
                  {formMsg && <span className="admin-msg">{formMsg}</span>}
                </div>
              </form>

              {/* Custom problems list */}
              {customProblems.length > 0 && (
                <div className="admin-problems-list">
                  <h4 className="admin-list-heading">Your Added Problems ({customProblems.length})</h4>
                  {customProblems.map(p => (
                    <div key={p.id} className="admin-problem-row">
                      <div className="admin-problem-info">
                        <span className="admin-problem-title">{p.title}</span>
                        <span className="admin-problem-meta">{p.category} · {p.difficulty}</span>
                      </div>
                      <button
                        onClick={() => deleteProblem(p.id)}
                        className="admin-delete-btn"
                        title="Delete problem"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manage admins tab (owner only) */}
          {tab === 'admins' && isOwner(userEmail) && (
            <div className="admin-section">
              <form onSubmit={handleAddAdmin} className="admin-form">
                <div className="admin-field">
                  <label>Add Admin by Email</label>
                  <div className="admin-inline">
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={e => setNewAdminEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="admin-input admin-input-wide"
                    />
                    <button type="submit" className="admin-btn-primary">Add Admin</button>
                  </div>
                  {adminMsg && <span className="admin-msg">{adminMsg}</span>}
                </div>
              </form>

              <div className="admin-problems-list">
                <h4 className="admin-list-heading">Current Admins</h4>
                {admins.map(a => (
                  <div key={a.email} className="admin-problem-row">
                    <div className="admin-problem-info">
                      <span className="admin-problem-title">{a.email}</span>
                      <span className={`admin-role-badge ${a.role}`}>{a.role}</span>
                    </div>
                    {a.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveAdmin(a.email)}
                        className="admin-delete-btn"
                        title="Remove admin"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
