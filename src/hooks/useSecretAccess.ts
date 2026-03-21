// useSecretAccess.ts
import { useNavigate } from 'react-router-dom'
import { secretTrigger } from '../stealth/secretTrigger'
import { transitionManager } from '../stealth/transitionManager'
import { ROUTES } from '../stealth/stealthRouter'

export function useSecretAccess() {
  const navigate = useNavigate()

  const activate = () => {
    transitionManager.trigger()
    secretTrigger.activate(() => {
      navigate(ROUTES.hidden)
    })
  }

  return { activate }
}
