import { TimeMode } from '@/types'

export class TimerSystem {
  private remainingTime: number = 0
  private timeMode: TimeMode | null = null
  private isRunning: boolean = false
  private onTimeUpCallback: (() => void) | null = null

  start(mode: TimeMode): void {
    this.timeMode = mode
    this.remainingTime = mode
    this.isRunning = true
    console.log(`Timer started: ${this.getFormattedTime()}`)
  }

  pause(): void {
    this.isRunning = false
  }

  resume(): void {
    this.isRunning = true
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return

    this.remainingTime -= deltaTime
    if (this.remainingTime <= 0) {
      this.remainingTime = 0
      this.isRunning = false
      if (this.onTimeUpCallback) {
        this.onTimeUpCallback()
      }
    }
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.remainingTime / 60)
    const seconds = Math.floor(this.remainingTime % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  getRemainingTime(): number {
    return this.remainingTime
  }

  isTimeUp(): boolean {
    return this.remainingTime <= 0
  }

  onTimeUp(callback: () => void): void {
    this.onTimeUpCallback = callback
  }

  getProgress(): number {
    if (!this.timeMode) return 0
    return (this.remainingTime / this.timeMode) * 100
  }
}
