// secretTrigger.ts
// Core trigger logic invoked when "everyone" is clicked

import { sessionGate } from './sessionGate'

type TriggerCallback = () => void

export const secretTrigger = {
  activate: (onActivated: TriggerCallback) => {
    sessionGate.authorize()
    // Small delay for transition feel
    setTimeout(onActivated, 200)
  },
}
