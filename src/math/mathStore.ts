import { create } from 'zustand'

export type Category = 'algebra' | 'geometry' | 'calculus' | 'proof' | 'number-theory' | string
export type Difficulty = 'easy' | 'medium' | 'hard' | 'olympiad'
export type TrainerType = 'mathforge' | 'theoria'

export interface MathCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  createdAt: number
  problemCount: number
}

export interface MathProblem {
  id: string
  type: TrainerType
  category: Category
  title: string
  problem: string
  answer?: string
  difficulty: Difficulty
  tags?: string[]
  hints?: string[]
  hint?: string // legacy support
  explanation?: string
  addedBy?: string
  createdAt?: number
}

export interface PlayerStats {
  level: number
  xp: number
  streak: number
  bestStreak: number
  totalAnswered: number
  correct: number
  points: number
  badges: string[]
  solvedByDifficulty: Record<Difficulty, number>
  solvedByTag: Record<string, number>
  solvedProblems: string[]
  solvedHistory: { id: string; difficulty: Difficulty; solvedAt: string; tags: string[] }[]
  lastSolvedDate: string | null
  seenIds: string[]
  allTimeSeenIds: string[]
}

const XP_PER_CORRECT: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 50, olympiad: 80 }
const POINTS_PER_SOLVE: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 50, olympiad: 80 }
const XP_TO_LEVEL = (level: number) => level * 100

function defaultStats(): PlayerStats {
  return {
    level: 1,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    totalAnswered: 0,
    correct: 0,
    points: 0,
    badges: [],
    solvedByDifficulty: { easy: 0, medium: 0, hard: 0, olympiad: 0 },
    solvedByTag: {},
    solvedProblems: [],
    solvedHistory: [],
    lastSolvedDate: null,
    seenIds: [],
    allTimeSeenIds: [],
  }
}

function loadStats(key: string): PlayerStats {
  try { return { ...defaultStats(), ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return defaultStats() }
}

function saveStats(key: string, s: PlayerStats) {
  localStorage.setItem(key, JSON.stringify(s))
}

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function getBadgeList(stats: PlayerStats) {
  const badges = new Set(stats.badges)
  if (stats.bestStreak >= 5) badges.add('5-day streak')
  if ((stats.solvedByTag.geometry || 0) >= 5) badges.add('Geometry Master')
  if ((stats.solvedByDifficulty.hard || 0) + (stats.solvedByDifficulty.olympiad || 0) >= 10) badges.add('Hard Solver')
  if (stats.points >= 500) badges.add('500 Club')
  return Array.from(badges)
}

export const DEFAULT_PROBLEMS: MathProblem[] = [
  { id: 'mf-a1', type: 'mathforge', category: 'algebra', title: 'Quadratic Roots', problem: 'x^2 - 5x + 6 = 0', answer: 'x=2,3', difficulty: 'easy', tags: ['algebra', 'quadratics'], hints: ['Factor into two binomials', 'Look for numbers multiplying to +6 and summing to -5'] },
  { id: 'mf-a2', type: 'mathforge', category: 'algebra', title: 'System of Equations', problem: '2x + 3y = 12,\\quad x - y = 1', answer: 'x=3,y=2', difficulty: 'medium', tags: ['algebra', 'systems'], hints: ['Try substitution: x = y + 1', 'Replace x in the first equation'] },
  { id: 'mf-a3', type: 'mathforge', category: 'algebra', title: 'Polynomial Division', problem: '\\dfrac{x^3 - 8}{x - 2}', answer: 'x^2+2x+4', difficulty: 'hard', tags: ['algebra', 'polynomials'], hints: ['Use difference of cubes', 'x^3-8=(x-2)(x^2+2x+4)'] },
  { id: 'mf-g1', type: 'mathforge', category: 'geometry', title: 'Circle Area', problem: 'A = \\pi r^2,\\quad r = 7', answer: '49π', difficulty: 'easy', tags: ['geometry', 'circles'], hints: ['Substitute r = 7', 'Square the radius first'] },
  { id: 'mf-g4', type: 'mathforge', category: 'geometry', title: 'Sector Area', problem: 'A = \\tfrac{\\theta}{2\\pi}\\pi r^2,\\quad r=6,\\ \\theta=\\tfrac{\\pi}{3}', answer: '6π', difficulty: 'medium', tags: ['geometry', 'circles'], hints: ['Simplify θ/(2π)', 'Then multiply by πr²'] },
  { id: 'mf-c3', type: 'mathforge', category: 'calculus', title: 'Chain Rule', problem: '\\dfrac{d}{dx}\\left[\\sin(x^2+1)\\right]', answer: '2x·cos(x²+1)', difficulty: 'hard', tags: ['calculus', 'derivatives'], hints: ['Outer function is sin(u)', 'Multiply by derivative of u=x²+1'] },
  { id: 'mf-nt1', type: 'mathforge', category: 'number-theory', title: 'Modular Inverse', problem: 'Find x such that 7x \\equiv 1 \\pmod{26}', answer: '15', difficulty: 'olympiad', tags: ['number theory', 'modular arithmetic', 'olympiad'], hints: ['Try small multiples of 7 modulo 26', '7*15=105 and 105 mod 26 = 1'] },
  { id: 'th-p1', type: 'theoria', category: 'proof', title: 'Sum of Even Numbers', problem: '\\text{Prove: The sum of two even integers is even.}', difficulty: 'easy', tags: ['proof', 'parity'], hints: ['Write each even number as 2k and 2m'], explanation: 'Let a=2k, b=2m. Then a+b=2(k+m), which is even.' },
  { id: 'th-p2', type: 'theoria', category: 'proof', title: 'Infinitely Many Primes', problem: '\\text{Prove: There are infinitely many prime numbers.}', difficulty: 'hard', tags: ['proof', 'number theory'], hints: ['Assume finitely many primes', 'Build N=p₁p₂...pₙ+1 and derive contradiction'], explanation: 'Assume p₁,…,pₙ are all primes. Let N=p₁·…·pₙ+1. N is not divisible by any pᵢ, so it has a new prime factor. Contradiction.' },
]

const CUSTOM_KEY = 'math_custom_problems'
const CATEGORIES_KEY = 'math_categories'
const FORGE_STATS_KEY = 'mathforge_stats'
const THEORIA_STATS_KEY = 'theoria_stats'

function loadCustom(): MathProblem[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]') } catch { return [] }
}
function saveCustom(p: MathProblem[]) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(p)) }

function loadCategories(): MathCategory[] {
  try { return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]') } catch { return [] }
}
function saveCategories(cats: MathCategory[]) { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats)) }

export const DEFAULT_CATEGORIES: MathCategory[] = [
  { id: 'algebra', name: 'Algebra', description: 'Equations, polynomials, and functions', color: '#2d6a4f', icon: 'x²', createdAt: 0, problemCount: 0 },
  { id: 'geometry', name: 'Geometry', description: 'Shapes, angles, and spatial relationships', color: '#185fa5', icon: '△', createdAt: 0, problemCount: 0 },
  { id: 'calculus', name: 'Calculus', description: 'Derivatives, integrals, and limits', color: '#9b2226', icon: '∫', createdAt: 0, problemCount: 0 },
  { id: 'number-theory', name: 'Number Theory', description: 'Divisibility, modular arithmetic, and primes', color: '#a16207', icon: 'ℤ', createdAt: 0, problemCount: 0 },
  { id: 'proof', name: 'Proofs', description: 'Mathematical proofs and logic', color: '#6b3fa0', icon: 'Θ', createdAt: 0, problemCount: 0 },
]

interface MathStore {
  customProblems: MathProblem[]
  addProblem: (p: Omit<MathProblem, 'id' | 'createdAt'>) => void
  deleteProblem: (id: string) => void

  customCategories: MathCategory[]
  addCategory: (c: Omit<MathCategory, 'id' | 'createdAt' | 'problemCount'>) => void
  editCategory: (id: string, updates: Partial<MathCategory>) => void
  deleteCategory: (id: string) => void
  getAllCategories: () => MathCategory[]

  forgeStats: PlayerStats
  theoriaStats: PlayerStats
  recordAnswer: (trainer: TrainerType, problem: MathProblem, correct: boolean) => void
  markSeen: (trainer: TrainerType, id: string) => void
  resetSeen: (trainer: TrainerType) => void
}

export const useMathStore = create<MathStore>((set, get) => ({
  customProblems: loadCustom(),
  customCategories: loadCategories(),
  addProblem: (p) => {
    const n: MathProblem = { ...p, id: 'custom-' + Date.now(), createdAt: Date.now() }
    const updated = [...get().customProblems, n]
    saveCustom(updated)
    set({ customProblems: updated })
  },
  deleteProblem: (id) => {
    const updated = get().customProblems.filter(p => p.id !== id)
    saveCustom(updated)
    set({ customProblems: updated })
  },
  addCategory: (c) => {
    const newCat: MathCategory = { ...c, id: 'cat-' + Date.now(), createdAt: Date.now(), problemCount: 0 }
    const updated = [...get().customCategories, newCat]
    saveCategories(updated)
    set({ customCategories: updated })
  },
  editCategory: (id, updates) => {
    const updated = get().customCategories.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    saveCategories(updated)
    set({ customCategories: updated })
  },
  deleteCategory: (id) => {
    if (DEFAULT_CATEGORIES.find(c => c.id === id)) return
    const updated = get().customCategories.filter(c => c.id !== id)
    saveCategories(updated)
    set({ customCategories: updated })
  },
  getAllCategories: () => [...DEFAULT_CATEGORIES, ...get().customCategories],

  forgeStats: loadStats(FORGE_STATS_KEY),
  theoriaStats: loadStats(THEORIA_STATS_KEY),

  recordAnswer: (trainer, problem, correct) => {
    const key = trainer === 'mathforge' ? 'forgeStats' : 'theoriaStats'
    const storageKey = trainer === 'mathforge' ? FORGE_STATS_KEY : THEORIA_STATS_KEY
    const solvedDate = toDateKey()
    set((s) => {
      const prev = s[key]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayKey = toDateKey(yesterday)
      const maintainsStreak = prev.lastSolvedDate === yesterdayKey
      const streak = correct ? (prev.lastSolvedDate === solvedDate ? prev.streak : maintainsStreak ? prev.streak + 1 : 1) : 0
      let xp = prev.xp + (correct ? XP_PER_CORRECT[problem.difficulty] : 0)
      let level = prev.level
      while (xp >= XP_TO_LEVEL(level)) { xp -= XP_TO_LEVEL(level); level++ }
      const next: PlayerStats = {
        ...prev,
        level,
        xp,
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        totalAnswered: prev.totalAnswered + 1,
        correct: prev.correct + (correct ? 1 : 0),
        points: prev.points + (correct ? POINTS_PER_SOLVE[problem.difficulty] : 0),
        solvedByDifficulty: {
          ...prev.solvedByDifficulty,
          [problem.difficulty]: prev.solvedByDifficulty[problem.difficulty] + (correct ? 1 : 0),
        },
        solvedByTag: (problem.tags || []).reduce((acc, tag) => {
          if (!correct) return acc
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        }, { ...prev.solvedByTag } as Record<string, number>),
        solvedProblems: correct && !prev.solvedProblems.includes(problem.id) ? [...prev.solvedProblems, problem.id] : prev.solvedProblems,
        solvedHistory: correct ? [{ id: problem.id, difficulty: problem.difficulty, solvedAt: new Date().toISOString(), tags: problem.tags || [] }, ...prev.solvedHistory].slice(0, 100) : prev.solvedHistory,
        lastSolvedDate: correct ? solvedDate : prev.lastSolvedDate,
        seenIds: prev.seenIds.includes(problem.id) ? prev.seenIds : [...prev.seenIds, problem.id],
        allTimeSeenIds: prev.allTimeSeenIds.includes(problem.id) ? prev.allTimeSeenIds : [...prev.allTimeSeenIds, problem.id],
      }
      next.badges = getBadgeList(next)
      saveStats(storageKey, next)
      return { [key]: next }
    })
  },

  markSeen: (trainer, id) => {
    const key = trainer === 'mathforge' ? 'forgeStats' : 'theoriaStats'
    set(s => ({ [key]: { ...s[key], seenIds: [...s[key].seenIds, id] } }))
  },

  resetSeen: (trainer) => {
    const key = trainer === 'mathforge' ? 'forgeStats' : 'theoriaStats'
    const storageKey = trainer === 'mathforge' ? FORGE_STATS_KEY : THEORIA_STATS_KEY
    set(s => {
      const next = { ...s[key], seenIds: [], allTimeSeenIds: [] }
      saveStats(storageKey, next)
      return { [key]: next }
    })
  },
}))

export function getAllProblems(customProblems: MathProblem[]): MathProblem[] {
  return [...DEFAULT_PROBLEMS, ...customProblems].map((problem) => ({
    ...problem,
    hints: problem.hints?.length ? problem.hints : problem.hint ? [problem.hint] : [],
    tags: problem.tags?.length ? problem.tags : [problem.category],
  }))
}

export function pickNextProblem(
  trainer: TrainerType,
  stats: PlayerStats,
  allProblems: MathProblem[],
  filterCategory?: Category,
  selectedTags: string[] = [],
  search = ''
): MathProblem | null {
  const query = search.trim().toLowerCase()
  const pool = allProblems.filter(p => {
    if (p.type !== trainer) return false
    if (filterCategory && p.category !== filterCategory) return false
    if (selectedTags.length > 0 && !selectedTags.every(tag => (p.tags || []).includes(tag))) return false
    if (query) {
      const haystack = `${p.title} ${(p.tags || []).join(' ')}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
  if (!pool.length) return null

  const targetDifficulty = levelToDifficulty(stats.level)
  const unseen = pool.filter(p => !stats.allTimeSeenIds.includes(p.id))
  const candidates = unseen.length > 0 ? unseen : pool
  const byDiff = candidates.filter(p => p.difficulty === targetDifficulty)
  const finalPool = byDiff.length > 0 ? byDiff : candidates
  return finalPool[Math.floor(Math.random() * finalPool.length)]
}

export function recommendProblems(allProblems: MathProblem[], solvedProblems: string[], targetDifficulty: Difficulty, limit = 4): MathProblem[] {
  const solvedSet = new Set(solvedProblems)
  return allProblems
    .filter(p => !solvedSet.has(p.id))
    .sort((a, b) => Number(b.difficulty === targetDifficulty) - Number(a.difficulty === targetDifficulty))
    .slice(0, limit)
}

export function levelToDifficulty(level: number): Difficulty {
  if (level <= 3) return 'easy'
  if (level <= 7) return 'medium'
  if (level <= 12) return 'hard'
  return 'olympiad'
}

export function accuracy(stats: PlayerStats): number {
  if (stats.totalAnswered === 0) return 0
  return Math.round((stats.correct / stats.totalAnswered) * 100)
}
