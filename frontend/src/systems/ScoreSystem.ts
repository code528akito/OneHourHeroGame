import { TimeMode } from '@/types'

export interface GameResult {
  timeMode: TimeMode
  remainingTime: number
  playerLevel: number
  monstersDefeated: number
  itemsCollected: number
  cleared: boolean
  score: number
  rank: string
}

export class ScoreSystem {
  calculateScore(
    timeMode: TimeMode,
    remainingTime: number,
    playerLevel: number,
    monstersDefeated: number,
    itemsCollected: number,
    cleared: boolean
  ): GameResult {
    let score = 0

    // 基本スコア（レベル × 100）
    score += playerLevel * 100

    // モンスター討伐ボーナス
    score += monstersDefeated * 50

    // アイテム収集ボーナス
    score += itemsCollected * 30

    // 残り時間ボーナス
    score += Math.floor(remainingTime * 10)

    // クリアボーナス
    if (cleared) {
      score += 1000
      // 時間モードによるクリアボーナス
      const timeModeBonus = {
        60: 5000,
        300: 4000,
        600: 3000,
        1800: 2000,
        3600: 1000,
      }
      score += timeModeBonus[timeMode] || 0
    }

    // ランク判定
    const rank = this.calculateRank(score, timeMode, cleared)

    return {
      timeMode,
      remainingTime,
      playerLevel,
      monstersDefeated,
      itemsCollected,
      cleared,
      score,
      rank,
    }
  }

  private calculateRank(score: number, timeMode: TimeMode, cleared: boolean): string {
    if (!cleared) {
      return 'C'
    }

    // 時間モード別のランク基準
    const rankThresholds = {
      60: { S: 8000, A: 6000, B: 4000 },
      300: { S: 10000, A: 7500, B: 5000 },
      600: { S: 12000, A: 9000, B: 6000 },
      1800: { S: 15000, A: 11000, B: 7500 },
      3600: { S: 20000, A: 15000, B: 10000 },
    }

    const thresholds = rankThresholds[timeMode] || rankThresholds[60]

    if (score >= thresholds.S) return 'S'
    if (score >= thresholds.A) return 'A'
    if (score >= thresholds.B) return 'B'
    return 'C'
  }

  getRankColor(rank: string): string {
    switch (rank) {
      case 'S':
        return '#fbbf24'
      case 'A':
        return '#60a5fa'
      case 'B':
        return '#34d399'
      case 'C':
        return '#9ca3af'
      default:
        return '#6b7280'
    }
  }

  getRankDescription(rank: string): string {
    switch (rank) {
      case 'S':
        return '完璧！真の勇者！'
      case 'A':
        return '素晴らしい！'
      case 'B':
        return 'よくできました'
      case 'C':
        return 'もう少し頑張ろう'
      default:
        return ''
    }
  }
}
