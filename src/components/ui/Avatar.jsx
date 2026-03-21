const COLORS = [
  ['#6173f3', '#e0e9ff'],
  ['#8b5cf6', '#ede9fe'],
  ['#06b6d4', '#cffafe'],
  ['#10b981', '#d1fae5'],
  ['#f59e0b', '#fef3c7'],
  ['#ef4444', '#fee2e2'],
  ['#ec4899', '#fce7f3'],
  ['#3b82f6', '#dbeafe'],
]

function getColor(name) {
  if (!name) return COLORS[0]
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

export default function Avatar({ name, src, size = 32 }) {
  const [imgError, setImgError] = useState(false)
  const [color, bg] = getColor(name)
  const initial = name?.[0]?.toUpperCase() || '?'
  const fontSize = size * 0.4

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        color,
        fontSize,
        minWidth: size,
      }}
    >
      {initial}
    </div>
  )
}

import { useState } from 'react'
