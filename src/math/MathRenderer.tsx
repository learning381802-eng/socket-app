// MathRenderer.tsx
import { useEffect, useRef } from 'react'

interface Props {
  math: string
  block?: boolean
}

declare global {
  interface Window {
    katex: any
  }
}

export default function MathRenderer({ math, block = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.katex) {
      try {
        window.katex.render(math, ref.current, {
          throwOnError: false,
          displayMode: block,
        })
      } catch {
        if (ref.current) ref.current.textContent = math
      }
    } else {
      // Fallback if KaTeX not loaded
      if (ref.current) ref.current.textContent = math
    }
  }, [math, block])

  return (
    <span
      ref={ref}
      className={block ? 'math-block' : 'math-inline'}
    />
  )
}
