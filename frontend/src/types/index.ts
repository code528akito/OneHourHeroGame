export enum TimeMode {
  ONE_MINUTE = 60,
  FIVE_MINUTES = 300,
  TEN_MINUTES = 600,
  THIRTY_MINUTES = 1800,
  SIXTY_MINUTES = 3600,
}

export enum GameState {
  TITLE_SCREEN = 'TITLE_SCREEN',
  MODE_SELECT = 'MODE_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  GAME_CLEAR = 'GAME_CLEAR',
}

export enum ClassType {
  KNIGHT = 'KNIGHT',
  MAGE = 'MAGE',
  THIEF = 'THIEF',
  ARCHER = 'ARCHER',
}

export enum ScoreRank {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
}

export interface User {
  id: string
  username: string
}

export interface PlayerProfile {
  id: string
  user_id: string
  unlocked_classes: string[]
  total_play_time: number
  total_games_played: number
  total_monsters_defeated: number
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  time_mode: string
  score: number
  rank: ScoreRank
  remaining_time: number
  player_level: number
  items_collected: number
  monsters_defeated: number
  cleared: boolean
  created_at: string
  user?: User
}

export interface Achievement {
  id: string
  name: string
  description: string
  reward_type: string
  reward_value: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement?: Achievement
}

export interface UserSettings {
  user_id: string
  sound_volume: number
  music_volume: number
  updated_at: string
}

export interface GameResult {
  timeMode: TimeMode
  remainingTime: number
  playerLevel: number
  achievedEvents?: string[]
  itemsCollected: number
  monstersDefeated: number
  cleared: boolean
  score: number
  rank: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Vector2 {
  x: number
  y: number
}
