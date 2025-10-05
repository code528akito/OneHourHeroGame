import { create } from 'zustand'
import { apiClient } from '@/api/client'
import type {
  User,
  PlayerProfile,
  GameState,
  TimeMode,
  Score,
  Achievement,
  GameResult,
} from '@/types'

interface GameStore {
  user: User | null
  token: string | null
  profile: PlayerProfile | null
  gameState: GameState
  timeMode: TimeMode | null
  classType: string | null
  currentScore: number
  achievements: Achievement[]
  isLoading: boolean
  error: string | null

  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
  setClassType: (classType: string) => void
  startGame: (mode: TimeMode) => void
  endGame: (result: GameResult) => Promise<void>
  loadAchievements: () => Promise<void>
  setGameState: (state: GameState) => void
  setError: (error: string | null) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  profile: null,
  gameState: 'TITLE_SCREEN' as GameState,
  timeMode: null,
  classType: 'KNIGHT', // デフォルトは騎士
  currentScore: 0,
  achievements: [],
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await apiClient.login(username, password)
      localStorage.setItem('authToken', response.token)
      set({ user: response.user, token: response.token })
      await get().loadProfile()
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'ログインに失敗しました', isLoading: false })
      throw error
    }
  },

  register: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await apiClient.register(username, password)
      localStorage.setItem('authToken', response.token)
      set({ user: response.user, token: response.token })
      await get().loadProfile()
      set({ isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.error || '登録に失敗しました',
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    set({
      user: null,
      token: null,
      profile: null,
      gameState: 'TITLE_SCREEN' as GameState,
    })
  },

  loadProfile: async () => {
    try {
      const profile = await apiClient.getProfile()
      set({ profile })
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  },

  setClassType: (classType: string) => {
    set({ classType })
  },

  startGame: (mode: TimeMode) => {
    set({ timeMode: mode, gameState: 'PLAYING' as GameState, currentScore: 0 })
  },

  endGame: async (result: GameResult) => {
    try {
      const score = await apiClient.saveScore({
        time_mode: result.timeMode.toString(),
        score: result.playerLevel * 100 + result.remainingTime,
        rank: 'A',
        remaining_time: result.remainingTime,
        player_level: result.playerLevel,
        items_collected: result.itemsCollected,
        monsters_defeated: result.monstersDefeated,
        cleared: result.cleared,
      })
      set({ currentScore: score.score, gameState: 'GAME_OVER' as GameState })
    } catch (error) {
      console.error('Failed to save score:', error)
      set({ gameState: 'GAME_OVER' as GameState })
    }
  },

  loadAchievements: async () => {
    try {
      const achievements = await apiClient.getAllAchievements()
      set({ achievements })
    } catch (error) {
      console.error('Failed to load achievements:', error)
    }
  },

  setGameState: (state: GameState) => {
    set({ gameState: state })
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))
