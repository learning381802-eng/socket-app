// SecretLink.tsx
// Renders "everyone" as plain-looking text with a hidden trigger

import { useSecretAccess } from '../hooks/useSecretAccess'
import { useStealthTransition } from '../hooks/useStealthTransition'

export default function SecretLink() {
  const { activate } = useSecretAccess()
  const { isActivating } = useStealthTransition()

  return (
    <span
      onClick={activate}
      style={{
        cursor: 'text',
        userSelect: 'none',
        opacity: isActivating ? 0.6 : 1,
        transition: 'opacity 0.2s',
        // Looks identical to surrounding text
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'none',
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
