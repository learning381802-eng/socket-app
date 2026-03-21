// transitionManager.ts
// Controls the visual transition when switching between math and chat interfaces

export type TransitionState = 'idle' | 'activating' | 'complete'

class TransitionManager {
  private state: TransitionState = 'idle'
  private listeners: Array<(state: TransitionState) => void> = []

  subscribe(fn: (state: TransitionState) => void) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn)
    }
  }

  private emit(state: TransitionState) {
    this.state = state
    this.listeners.forEach((l) => l(state))
  }

  trigger() {
    this.emit('activating')
    setTimeout(() => this.emit('complete'), 300)
  }

  getState() {
    return this.state
  }

  reset() {
    this.emit('idle')
  }
}

export const transitionManager = new TransitionManager()
