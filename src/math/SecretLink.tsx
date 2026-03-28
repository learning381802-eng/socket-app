// SecretLink.tsx
// Renders "everyone" as plain-looking text with a hidden trigger

import { useSecretAccess } from '../hooks/useSecretAccess'
import { useStealthTransition } from '../hooks/useStealthTransition'
import { useState } from 'react'

export default function SecretLink() {
  const { activate } = useSecretAccess()
  const { isActivating } = useStealthTransition()
  const [hover, setHover] = useState(false)

  return (
    <span
      onClick={activate}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'text',
        userSelect: 'none',
        opacity: isActivating ? 0.6 : 1,
        transition: 'opacity 0.2s, text-decoration-color 0.25s',
        textDecorationColor: hover ? 'rgba(26,71,42,0.45)' : 'transparent',
        // Looks identical to surrounding text
        font: 'inherit',
        color: 'inherit',
        textDecoration: hover ? 'underline dotted' : 'none',
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'inline',
      }}
      role="presentation"
      aria-hidden="false"
    >
      everyone
    </span>
  )
}
