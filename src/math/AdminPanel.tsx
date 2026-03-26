// AdminPanel.tsx
import { useState } from 'react'
import { useMathStore, TrainerType, Category, Difficulty } from './mathStore'
import { getMathAdmins, addMathAdmin, removeMathAdmin } from '../pages/MathHomepage'
import CategoriesManager from './CategoriesManager'

interface Props { userEmail: string }

const isOwner = (e: string) => e === 'jason38180202@gmail.com'

export default function AdminPanel({ userEmail }: Props) {
  const [open, setOpen]     = useState(false)
  const [tab, setTab]       = useState<'add' | 'list' | 'admins' | 'categories'>('categories')
  const { addProblem, customProblems, deleteProblem } = useMathStore()
  const [admins, setAdmins] = useState(getMathAdmins)
  const [newEmail, setNewEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const [formMsg, setFormMsg]   = useState('')

  const [form, setForm] = useState({
    type:        'mathforge' as TrainerType,
    title:       '',
    problem:     '',
    category:    'algebra' as Category,
    difficulty:  'easy' as Difficulty,
    hint:        '',
    answer:      '',
    explanation: '',
  })

  const isProof = form.type === 'theoria'

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.problem.trim()) {
      setFormMsg('Title and problem are required.'); return
    }
    addProblem({
      type: form.type,
      title: form.title,
      problem: form.problem,
      category: isProof ? 'proof' : form.category,
      difficulty: form.difficulty,
      hint:        form.hint        || undefined,
      answer:      form.answer      || undefined,
      explanation: form.explanation || undefined,
    })
    setForm({ type: 'mathforge', title: '', problem: '', category: 'algebra',
              difficulty: 'easy', hint: '', answer: '', explanation: '' })
    setFormMsg('✓ Problem added!')
    setTimeout(() => setFormMsg(''), 3000)
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.includes('@')) { setAdminMsg('Enter a valid email.'); return }
    if (admins.find(a => a.email === newEmail)) { setAdminMsg('Already an admin.'); return }
    addMathAdmin(newEmail.trim())
    setAdmins(getMathAdmins())
    setNewEmail('')
    setAdminMsg('✓ Admin added!')
    setTimeout(() => setAdminMsg(''), 3000)
  }

  return (
    <div className="admin-panel">
      <button className="admin-toggle" onClick={() => setOpen(!open)}>
        {open ? '▼' : '▶'} Admin Panel
        <span className="admin-badge">{isOwner(userEmail) ? 'Owner' : 'Admin'}</span>
      </button>

      {open && (
        <div className="admin-body">
          <div className="admin-tabs">
            <button className={`admin-tab ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>📁 Categories</button>
            <button className={`admin-tab ${tab === 'add'    ? 'active' : ''}`} onClick={() => setTab('add')}>+ Add Problem</button>
            <button className={`admin-tab ${tab === 'list'   ? 'active' : ''}`} onClick={() => setTab('list')}>
              My Problems {customProblems.length > 0 && `(${customProblems.length})`}
            </button>
            {isOwner(userEmail) && (
              <button className={`admin-tab ${tab === 'admins' ? 'active' : ''}`} onClick={() => setTab('admins')}>👥 Admins</button>
            )}
          </div>

          {/* ── CATEGORIES MANAGER ── */}
          {tab === 'categories' && (
            <div className="admin-section">
              <CategoriesManager />
            </div>
          )}

          {/* ── ADD PROBLEM ── */}
          {tab === 'add' && (
            <div className="admin-section">
              <form onSubmit={handleAdd} className="admin-form">
                {/* Trainer toggle */}
                <div className="admin-field">
                  <label>Trainer</label>
                  <div className="trainer-toggle-row">
                    <button type="button"
                      className={`trainer-toggle-btn ${form.type === 'mathforge' ? 'active-forge' : ''}`}
                      onClick={() => setF('type', 'mathforge')}>
                      ⚒ MathForge
                    </button>
                    <button type="button"
                      className={`trainer-toggle-btn ${form.type === 'theoria' ? 'active-theoria' : ''}`}
                      onClick={() => setF('type', 'theoria')}>
                      Θ Theoria
                    </button>
                  </div>
                </div>

                <div className="admin-row">
                  <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Problem Title *</label>
                    <input value={form.title} onChange={e => setF('title', e.target.value)}
                      placeholder="e.g. Quadratic Formula" className="admin-input admin-input-wide" />
                  </div>
                </div>

                <div className="admin-row">
                  {!isProof && (
                    <div className="admin-field">
                      <label>Category</label>
                      <select value={form.category} onChange={e => setF('category', e.target.value)} className="admin-input">
                        <option value="algebra">Algebra</option>
                        <option value="geometry">Geometry</option>
                        <option value="calculus">Calculus</option>
                      </select>
                    </div>
                  )}
                  <div className="admin-field">
                    <label>Difficulty</label>
                    <select value={form.difficulty} onChange={e => setF('difficulty', e.target.value)} className="admin-input">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="admin-field">
                  <label>LaTeX Problem *</label>
                  <input value={form.problem} onChange={e => setF('problem', e.target.value)}
                    placeholder={isProof ? '\\text{Prove: ...}' : 'x^2 + 5x + 6 = 0'}
                    className="admin-input admin-input-wide" />
                  <p className="admin-hint-text">Use LaTeX: x^2, \frac{"{a}{b}"}, \sqrt{"{x}"}, \int, \text{"{...}"}</p>
                </div>

                {!isProof && (
                  <div className="admin-field">
                    <label>Expected Answer (optional — for auto-check)</label>
                    <input value={form.answer} onChange={e => setF('answer', e.target.value)}
                      placeholder="e.g. x=-2,-3" className="admin-input admin-input-wide" />
                  </div>
                )}

                <div className="admin-field">
                  <label>Hint (optional)</label>
                  <input value={form.hint} onChange={e => setF('hint', e.target.value)}
                    placeholder="A helpful nudge..." className="admin-input admin-input-wide" />
                </div>

                <div className="admin-field">
                  <label>{isProof ? 'Model Proof / Explanation *' : 'Explanation (shown after answering)'}</label>
                  <textarea value={form.explanation} onChange={e => setF('explanation', e.target.value)}
                    placeholder={isProof ? 'Write the model proof here...' : 'Optional step-by-step explanation...'}
                    className="admin-input admin-input-wide" rows={3}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>

                <div className="admin-actions">
                  <button type="submit" className="admin-btn-primary">
                    Add to {form.type === 'mathforge' ? 'MathForge' : 'Theoria'}
                  </button>
                  {formMsg && <span className="admin-msg">{formMsg}</span>}
                </div>
              </form>
            </div>
          )}

          {/* ── PROBLEM LIST ── */}
          {tab === 'list' && (
            <div className="admin-section">
              {customProblems.length === 0 ? (
                <p style={{ color: '#888', fontSize: 13, padding: '12px 0' }}>
                  No custom problems added yet.
                </p>
              ) : (
                <div className="admin-problems-list">
                  <h4 className="admin-list-heading">Custom Problems ({customProblems.length})</h4>
                  {customProblems.map(p => (
                    <div key={p.id} className="admin-problem-row">
                      <div className="admin-problem-info">
                        <span className={`trainer-type-dot ${p.type}`} />
                        <span className="admin-problem-title">{p.title}</span>
                        <span className="admin-problem-meta">
                          {p.type === 'mathforge' ? '⚒' : 'Θ'} {p.category} · {p.difficulty}
                        </span>
                      </div>
                      <button onClick={() => deleteProblem(p.id)} className="admin-delete-btn" title="Delete">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADMINS ── */}
          {tab === 'admins' && isOwner(userEmail) && (
            <div className="admin-section">
              <form onSubmit={handleAddAdmin} className="admin-form">
                <div className="admin-field">
                  <label>Add Admin by Email</label>
                  <div className="admin-inline">
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                      placeholder="user@example.com" className="admin-input admin-input-wide" />
                    <button type="submit" className="admin-btn-primary">Add</button>
                  </div>
                  {adminMsg && <span className="admin-msg">{adminMsg}</span>}
                </div>
              </form>
              <div className="admin-problems-list" style={{ marginTop: 16 }}>
                <h4 className="admin-list-heading">Current Admins</h4>
                {admins.map(a => (
                  <div key={a.email} className="admin-problem-row">
                    <div className="admin-problem-info">
                      <span className="admin-problem-title">{a.email}</span>
                      <span className={`admin-role-badge ${a.role}`}>{a.role}</span>
                    </div>
                    {a.role !== 'owner' && (
                      <button onClick={() => { removeMathAdmin(a.email); setAdmins(getMathAdmins()) }}
                        className="admin-delete-btn">✕</button>
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
