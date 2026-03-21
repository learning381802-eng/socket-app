// MathRenderer.tsx
import { useEffect, useRef, useState } from 'react'

interface Props {
  math: string
  block?: boolean
}

declare global {
  interface Window {
    katex: any
  }
}

function renderKatex(el: HTMLElement, math: string, block: boolean) {
  window.katex.render(math, el, {
    throwOnError: false,
    displayMode: block,
    strict: false,
  })
}

export default function MathRenderer({ math, block = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(!!window.katex)

  // Poll until KaTeX is loaded (handles defer script)
  useEffect(() => {
    if (window.katex) { setReady(true); return }
    const interval = setInterval(() => {
      if (window.katex) {
        setReady(true)
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!ref.current || !ready) return
    try {
      renderKatex(ref.current, math, block)
    } catch {
      if (ref.current) ref.current.textContent = math
    }
  }, [math, block, ready])

  return (
    <span
      ref={ref}
      className={block ? 'math-block' : 'math-inline'}
      style={!ready ? { fontFamily: 'monospace', fontSize: 15, color: '#444' } : {}}
    >
      {!ready ? math : null}
    </span>
  )
}
