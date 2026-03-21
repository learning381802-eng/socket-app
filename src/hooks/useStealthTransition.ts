// useStealthTransition.ts
import { useState, useEffect } from 'react'
import { transitionManager, TransitionState } from '../stealth/transitionManager'

export function useStealthTransition() {
  const [state, setState] = useState<TransitionState>('idle')

  useEffect(() => {
    const unsub = transitionManager.subscribe(setState)
    return unsub
  }, [])

  return {
    isActivating: state === 'activating',
    isComplete: state === 'complete',
    isIdle: state === 'idle',
  }
}
