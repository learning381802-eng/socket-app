// mathStore.ts
import { create } from 'zustand'

export type Category = 'all' | 'algebra' | 'geometry' | 'calculus'

export interface MathProblem {
  id: string
  category: Category
  title: string
  problem: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
  addedBy?: string
  createdAt?: number
}

interface MathStore {
  activeCategory: Category
  setCategory: (cat: Category) => void
  submissions: Record<string, string>
  submitAnswer: (id: string, answer: string) => void
  customProblems: MathProblem[]
  addProblem: (p: Omit<MathProblem, 'id' | 'createdAt'>) => void
  deleteProblem: (id: string) => void
  loadCustomProblems: () => void
}

export const DEFAULT_PROBLEMS: MathProblem[] = [
  {
    id: 'default-1',
    category: 'algebra',
    title: 'Quadratic Roots',
    problem: 'x^2 - 5x + 6 = 0',
    difficulty: 'easy',
    hint: 'Factor into two binomials',
  },
  {
    id: 'default-2',
    category: 'algebra',
    title: 'System of Equations',
    problem: '2x + 3y = 12,\\quad x - y = 1',
    difficulty: 'medium',
    hint: 'Use substitution or elimination',
  },
  {
    id: 'default-3',
    category: 'geometry',
    title: 'Circle Area',
    problem: 'A = \\pi r^2 \\text{ where } r = 7',
    difficulty: 'easy',
    hint: 'Substitute r = 7 into the formula',
  },
  {
    id: 'default-4',
    category: 'geometry',
    title: "Pythagorean Theorem",
    problem: 'a^2 + b^2 = c^2 \\text{ where } a=3, b=4',
    difficulty: 'easy',
    hint: 'Solve for c',
  },
  {
    id: 'default-5',
    category: 'calculus',
    title: 'Derivative',
    problem: '\\frac{d}{dx}[3x^3 - 2x^2 + x - 5]',
    difficulty: 'medium',
    hint: 'Apply the power rule to each term',
  },
  {
    id: 'default-6',
    category: 'calculus',
    title: 'Definite Integral',
    problem: '\\int_0^2 (x^2 + 1)\\,dx',
    difficulty: 'medium',
    hint: 'Integrate then evaluate at bounds',
  },
  {
    id: 'default-7',
    category: 'algebra',
    title: 'Polynomial Division',
    problem: '\\frac{x^3 - 8}{x - 2}',
    difficulty: 'hard',
    hint: 'Use long division or factor the numerator',
  },
  {
    id: 'default-8',
    category: 'calculus',
    title: 'Chain Rule',
    problem: '\\frac{d}{dx}[\\sin(x^2 + 1)]',
    difficulty: 'hard',
    hint: 'Apply the chain rule: f(g(x))\' = f\'(g(x)) · g\'(x)',
  },
  {
    id: 'default-9',
    category: 'geometry',
    title: 'Triangle Area',
    problem: 'A = \\frac{1}{2}bh \\text{ where } b=10, h=6',
    difficulty: 'easy',
    hint: 'Plug values into the formula',
  },
]

const STORAGE_KEY = 'math_custom_problems'

function loadFromStorage(): MathProblem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToStorage(problems: MathProblem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems))
}

export const useMathStore = create<MathStore>((set, get) => ({
  activeCategory: 'all',
  setCategory: (cat) => set({ activeCategory: cat }),
  submissions: {},
  submitAnswer: (id, answer) =>
    set((s) => ({ submissions: { ...s.submissions, [id]: answer } })),
  customProblems: loadFromStorage(),
  loadCustomProblems: () => set({ customProblems: loadFromStorage() }),
  addProblem: (p) => {
    const newProblem: MathProblem = {
      ...p,
      id: 'custom-' + Date.now(),
      createdAt: Date.now(),
    }
    const updated = [...get().customProblems, newProblem]
    saveToStorage(updated)
    set({ customProblems: updated })
  },
  deleteProblem: (id) => {
    const updated = get().customProblems.filter((p) => p.id !== id)
    saveToStorage(updated)
    set({ customProblems: updated })
  },
}))

// All problems combined
export function getAllProblems(store: { customProblems: MathProblem[] }): MathProblem[] {
  return [...DEFAULT_PROBLEMS, ...store.customProblems]
}
