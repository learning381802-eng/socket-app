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
}

interface MathStore {
  activeCategory: Category
  setCategory: (cat: Category) => void
  submissions: Record<string, string>
  submitAnswer: (id: string, answer: string) => void
}

export const useMathStore = create<MathStore>((set) => ({
  activeCategory: 'all',
  setCategory: (cat) => set({ activeCategory: cat }),
  submissions: {},
  submitAnswer: (id, answer) =>
    set((s) => ({ submissions: { ...s.submissions, [id]: answer } })),
}))

export const MATH_PROBLEMS: MathProblem[] = [
  {
    id: '1',
    category: 'algebra',
    title: 'Quadratic Roots',
    problem: 'x^2 - 5x + 6 = 0',
    difficulty: 'easy',
    hint: 'Factor into two binomials',
  },
  {
    id: '2',
    category: 'algebra',
    title: 'System of Equations',
    problem: '2x + 3y = 12,\\quad x - y = 1',
    difficulty: 'medium',
    hint: 'Use substitution or elimination',
  },
  {
    id: '3',
    category: 'geometry',
    title: 'Circle Area',
    problem: 'A = \\pi r^2 \\text{ where } r = 7',
    difficulty: 'easy',
    hint: 'Substitute r = 7 into the formula',
  },
  {
    id: '4',
    category: 'geometry',
    title: "Pythagorean Theorem",
    problem: 'a^2 + b^2 = c^2 \\text{ where } a=3, b=4',
    difficulty: 'easy',
    hint: 'Solve for c',
  },
  {
    id: '5',
    category: 'calculus',
    title: 'Derivative',
    problem: '\\frac{d}{dx}[3x^3 - 2x^2 + x - 5]',
    difficulty: 'medium',
    hint: 'Apply the power rule to each term',
  },
  {
    id: '6',
    category: 'calculus',
    title: 'Definite Integral',
    problem: '\\int_0^2 (x^2 + 1)\\,dx',
    difficulty: 'medium',
    hint: 'Integrate then evaluate at bounds',
  },
  {
    id: '7',
    category: 'algebra',
    title: 'Polynomial Division',
    problem: '\\frac{x^3 - 8}{x - 2}',
    difficulty: 'hard',
    hint: 'Use long division or factor the numerator',
  },
  {
    id: '8',
    category: 'calculus',
    title: 'Chain Rule',
    problem: '\\frac{d}{dx}[\\sin(x^2 + 1)]',
    difficulty: 'hard',
    hint: 'Apply the chain rule: f(g(x))\' = f\'(g(x)) · g\'(x)',
  },
  {
    id: '9',
    category: 'geometry',
    title: 'Triangle Area',
    problem: 'A = \\frac{1}{2}bh \\text{ where } b=10, h=6',
    difficulty: 'easy',
    hint: 'Plug values into the formula',
  },
]
