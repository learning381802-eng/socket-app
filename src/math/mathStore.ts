// mathStore.ts
import { create } from 'zustand'

export type Category = 'algebra' | 'geometry' | 'calculus' | 'proof'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type TrainerType = 'mathforge' | 'theoria'

export interface MathProblem {
  id: string
  type: TrainerType
  category: Category
  title: string
  problem: string        // LaTeX string
  answer?: string        // expected answer (optional, for auto-check)
  difficulty: Difficulty
  hint?: string
  explanation?: string   // shown after answering
  addedBy?: string
  createdAt?: number
}

// ── Player progression ────────────────────────────────────────────
export interface PlayerStats {
  level: number
  xp: number
  streak: number
  totalAnswered: number
  correct: number
  seenIds: string[]       // ids seen this session (reset on page reload)
  allTimeSeenIds: string[] // never repeat across sessions
}

const XP_PER_CORRECT = { easy: 10, medium: 20, hard: 35 }
const XP_TO_LEVEL = (level: number) => level * 100

function defaultStats(): PlayerStats {
  return { level: 1, xp: 0, streak: 0, totalAnswered: 0, correct: 0, seenIds: [], allTimeSeenIds: [] }
}

function loadStats(key: string): PlayerStats {
  try { return { ...defaultStats(), ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return defaultStats() }
}

function saveStats(key: string, s: PlayerStats) {
  localStorage.setItem(key, JSON.stringify(s))
}

// ── Default problems ─────────────────────────────────────────────
export const DEFAULT_PROBLEMS: MathProblem[] = [
  // MathForge — algebra
  { id: 'mf-a1', type: 'mathforge', category: 'algebra', title: 'Quadratic Roots', problem: 'x^2 - 5x + 6 = 0', answer: 'x=2,3', difficulty: 'easy', hint: 'Factor into two binomials' },
  { id: 'mf-a2', type: 'mathforge', category: 'algebra', title: 'System of Equations', problem: '2x + 3y = 12,\\quad x - y = 1', answer: 'x=3,y=2', difficulty: 'medium', hint: 'Try substitution: x = y + 1' },
  { id: 'mf-a3', type: 'mathforge', category: 'algebra', title: 'Polynomial Division', problem: '\\dfrac{x^3 - 8}{x - 2}', answer: 'x^2+2x+4', difficulty: 'hard', hint: 'Factor the numerator as a difference of cubes' },
  { id: 'mf-a4', type: 'mathforge', category: 'algebra', title: 'Completing the Square', problem: 'x^2 + 6x + 5 = 0', answer: 'x=-1,-5', difficulty: 'easy', hint: 'Move constant, add (b/2)² to both sides' },
  { id: 'mf-a5', type: 'mathforge', category: 'algebra', title: 'Exponential Equation', problem: '2^{x+1} = 32', answer: 'x=4', difficulty: 'medium', hint: 'Write 32 as a power of 2' },
  // MathForge — geometry
  { id: 'mf-g1', type: 'mathforge', category: 'geometry', title: 'Circle Area', problem: 'A = \\pi r^2,\\quad r = 7', answer: '49π', difficulty: 'easy', hint: 'Substitute r = 7' },
  { id: 'mf-g2', type: 'mathforge', category: 'geometry', title: 'Pythagorean Theorem', problem: 'a^2 + b^2 = c^2,\\quad a=3,\\ b=4', answer: 'c=5', difficulty: 'easy', hint: 'Solve for c' },
  { id: 'mf-g3', type: 'mathforge', category: 'geometry', title: 'Triangle Area', problem: 'A = \\tfrac{1}{2}bh,\\quad b=10,\\ h=6', answer: '30', difficulty: 'easy', hint: 'Plug values into the formula' },
  { id: 'mf-g4', type: 'mathforge', category: 'geometry', title: 'Sector Area', problem: 'A = \\tfrac{\\theta}{2\\pi}\\pi r^2,\\quad r=6,\\ \\theta=\\tfrac{\\pi}{3}', answer: '6π', difficulty: 'medium', hint: 'Simplify the fraction first' },
  { id: 'mf-g5', type: 'mathforge', category: 'geometry', title: 'Volume of Sphere', problem: 'V = \\tfrac{4}{3}\\pi r^3,\\quad r=3', answer: '36π', difficulty: 'medium', hint: 'Cube r first, then multiply' },
  // MathForge — calculus
  { id: 'mf-c1', type: 'mathforge', category: 'calculus', title: 'Power Rule', problem: '\\dfrac{d}{dx}\\left[3x^3 - 2x^2 + x - 5\\right]', answer: '9x²-4x+1', difficulty: 'medium', hint: 'Apply power rule to each term' },
  { id: 'mf-c2', type: 'mathforge', category: 'calculus', title: 'Definite Integral', problem: '\\displaystyle\\int_0^2 (x^2 + 1)\\,dx', answer: '14/3', difficulty: 'medium', hint: 'Integrate then evaluate at x=2 and x=0' },
  { id: 'mf-c3', type: 'mathforge', category: 'calculus', title: 'Chain Rule', problem: '\\dfrac{d}{dx}\\left[\\sin(x^2+1)\\right]', answer: '2x·cos(x²+1)', difficulty: 'hard', hint: 'Outer function: sin, inner: x²+1' },
  { id: 'mf-c4', type: 'mathforge', category: 'calculus', title: 'Product Rule', problem: '\\dfrac{d}{dx}\\left[x^2 e^x\\right]', answer: 'xe^x(x+2)', difficulty: 'hard', hint: 'f·g\' + f\'·g' },
  { id: 'mf-c5', type: 'mathforge', category: 'calculus', title: 'Limit', problem: '\\displaystyle\\lim_{x \\to 0} \\dfrac{\\sin x}{x}', answer: '1', difficulty: 'easy', hint: 'This is a standard limit' },
  // Theoria — proofs
  { id: 'th-p1', type: 'theoria', category: 'proof', title: 'Sum of Even Numbers', problem: '\\text{Prove: The sum of two even integers is even.}', difficulty: 'easy', hint: 'Write each even number as 2k and 2m', explanation: 'Let a=2k, b=2m. Then a+b=2(k+m), which is even.' },
  { id: 'th-p2', type: 'theoria', category: 'proof', title: 'Infinitely Many Primes', problem: '\\text{Prove: There are infinitely many prime numbers.}', difficulty: 'hard', hint: 'Assume finitely many and derive a contradiction (Euclid)', explanation: 'Assume p₁,…,pₙ are all primes. Let N=p₁·…·pₙ+1. N is not divisible by any pᵢ, so it has a new prime factor. Contradiction.' },
  { id: 'th-p3', type: 'theoria', category: 'proof', title: 'Square Root of 2', problem: '\\text{Prove: }\\sqrt{2}\\text{ is irrational.}', difficulty: 'medium', hint: 'Assume √2 = p/q in lowest terms and derive a contradiction', explanation: 'If √2=p/q then 2q²=p², so p is even. Write p=2k; then 2q²=4k², so q is even. Contradicts lowest terms.' },
  { id: 'th-p4', type: 'theoria', category: 'proof', title: 'Odd Square', problem: '\\text{Prove: If } n \\text{ is odd, then } n^2 \\text{ is odd.}', difficulty: 'easy', hint: 'Write n = 2k+1 and expand', explanation: 'n=2k+1, so n²=4k²+4k+1=2(2k²+2k)+1, which is odd.' },
  { id: 'th-p5', type: 'theoria', category: 'proof', title: 'Divisibility by 3', problem: '\\text{Prove: } 3 \\mid n(n+1)(n+2) \\text{ for all integers } n.', difficulty: 'medium', hint: 'Among any 3 consecutive integers, one is divisible by 3', explanation: 'In any 3 consecutive integers, exactly one is ≡0 (mod 3), so their product is divisible by 3.' },
  { id: 'th-p6', type: 'theoria', category: 'proof', title: 'AM-GM Inequality', problem: '\\text{Prove: } \\dfrac{a+b}{2} \\geq \\sqrt{ab} \\text{ for } a,b \\geq 0.', difficulty: 'medium', hint: 'Start from (√a - √b)² ≥ 0', explanation: '(√a−√b)²≥0 ⟹ a−2√(ab)+b≥0 ⟹ a+b≥2√(ab) ⟹ (a+b)/2≥√(ab).' },
  { id: 'th-p7', type: 'theoria', category: 'proof', title: 'Cantor's Diagonal', problem: '\\text{Prove: The real numbers are uncountable.}', difficulty: 'hard', hint: 'Assume a list of all reals and construct a number not in the list', explanation: 'Given any list r₁,r₂,…, define x whose nth decimal digit differs from the nth digit of rₙ. Then x≠rₙ for all n, so no list is complete.' },
]

// ── Storage helpers ───────────────────────────────────────────────
const CUSTOM_KEY = 'math_custom_problems'
const FORGE_STATS_KEY = 'mathforge_stats'
const THEORIA_STATS_KEY = 'theoria_stats'

function loadCustom(): MathProblem[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]') } catch { return [] }
}
function saveCustom(p: MathProblem[]) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(p)) }

// ── Store ─────────────────────────────────────────────────────────
interface MathStore {
  customProblems: MathProblem[]
  addProblem: (p: Omit<MathProblem, 'id' | 'createdAt'>) => void
  deleteProblem: (id: string) => void

  forgeStats: PlayerStats
  theoriaStats: PlayerStats
  recordAnswer: (trainer: TrainerType, problemId: string, correct: boolean, difficulty: Difficulty) => void
  markSeen: (trainer: TrainerType, id: string) => void
  resetSeen: (trainer: TrainerType) => void
}

export const useMathStore = create<MathStore>((set, get) => ({
  customProblems: loadCustom(),

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

  forgeStats: loadStats(FORGE_STATS_KEY),
  theoriaStats: loadStats(THEORIA_STATS_KEY),

  recordAnswer: (trainer, problemId, correct, difficulty) => {
    const key = trainer === 'mathforge' ? 'forgeStats' : 'theoriaStats'
    const storageKey = trainer === 'mathforge' ? FORGE_STATS_KEY : THEORIA_STATS_KEY
    set(s => {
      const prev = s[key]
      let xp = prev.xp + (correct ? XP_PER_CORRECT[difficulty] : 0)
      let level = prev.level
      // Level up loop
      while (xp >= XP_TO_LEVEL(level)) { xp -= XP_TO_LEVEL(level); level++ }
      const next: PlayerStats = {
        ...prev,
        level,
        xp,
        streak: correct ? prev.streak + 1 : 0,
        totalAnswered: prev.totalAnswered + 1,
        correct: prev.correct + (correct ? 1 : 0),
        allTimeSeenIds: prev.allTimeSeenIds.includes(problemId)
          ? prev.allTimeSeenIds
          : [...prev.allTimeSeenIds, problemId],
      }
      saveStats(storageKey, next)
      return { [key]: next }
    })
  },

  markSeen: (trainer, id) => {
    const key = trainer === 'mathforge' ? 'forgeStats' : 'theoriaStats'
    set(s => ({
      [key]: { ...s[key], seenIds: [...s[key].seenIds, id] }
    }))
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

// ── Helpers ───────────────────────────────────────────────────────
export function getAllProblems(customProblems: MathProblem[]): MathProblem[] {
  return [...DEFAULT_PROBLEMS, ...customProblems]
}

/** Pick next unseen problem appropriate for player level */
export function pickNextProblem(
  trainer: TrainerType,
  stats: PlayerStats,
  allProblems: MathProblem[],
  filterCategory?: Category
): MathProblem | null {
  const pool = allProblems.filter(p => {
    if (p.type !== trainer) return false
    if (filterCategory && filterCategory !== 'proof' && p.category !== filterCategory) return false
    if (filterCategory === 'proof' && p.category !== 'proof') return false
    return true
  })
  if (pool.length === 0) return null

  const targetDifficulty = levelToDifficulty(stats.level)

  // Prefer unseen (all-time), fall back to unseen this session, fall back to anything
  const unseen = pool.filter(p => !stats.allTimeSeenIds.includes(p.id))
  const unseenSession = pool.filter(p => !stats.seenIds.includes(p.id))
  const candidates = unseen.length > 0 ? unseen : (unseenSession.length > 0 ? unseenSession : pool)

  // Within candidates, prefer matching difficulty
  const byDiff = candidates.filter(p => p.difficulty === targetDifficulty)
  const finalPool = byDiff.length > 0 ? byDiff : candidates

  return finalPool[Math.floor(Math.random() * finalPool.length)]
}

export function levelToDifficulty(level: number): Difficulty {
  if (level <= 3) return 'easy'
  if (level <= 7) return 'medium'
  return 'hard'
}

export function accuracy(stats: PlayerStats): number {
  if (stats.totalAnswered === 0) return 0
  return Math.round((stats.correct / stats.totalAnswered) * 100)
}
