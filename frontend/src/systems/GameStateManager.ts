import { GameState } from '@/types'

export class GameStateManager {
  private currentState: GameState = GameState.TITLE_SCREEN
  private listeners: Map<GameState, (() => void)[]> = new Map()

  getCurrentState(): GameState {
    return this.currentState
  }

  changeState(newState: GameState): void {
    console.log(`Game state changing: ${this.currentState} -> ${newState}`)
    this.currentState = newState
    this.notifyListeners(newState)
  }

  onStateChange(state: GameState, callback: () => void): void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, [])
    }
    this.listeners.get(state)!.push(callback)
  }

  private notifyListeners(state: GameState): void {
    const callbacks = this.listeners.get(state)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }

  isPlaying(): boolean {
    return this.currentState === GameState.PLAYING
  }

  isPaused(): boolean {
    return this.currentState === GameState.PAUSED
  }

  isGameOver(): boolean {
    return (
      this.currentState === GameState.GAME_OVER || this.currentState === GameState.GAME_CLEAR
    )
  }
}
