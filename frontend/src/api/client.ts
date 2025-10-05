import axios, { AxiosInstance } from 'axios'
import type { AuthResponse, PlayerProfile, Score, Achievement, UserSettings } from '@/types'

class GameAPIClient {
  private axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.axios.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axios.post('/auth/register', { username, password })
    return response.data
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axios.post('/auth/login', { username, password })
    return response.data
  }

  async getMe(): Promise<{ id: string; username: string }> {
    const response = await this.axios.get('/auth/me')
    return response.data
  }

  async getProfile(): Promise<PlayerProfile> {
    const response = await this.axios.get('/player/profile')
    return response.data
  }

  async updateProfile(data: Partial<PlayerProfile>): Promise<PlayerProfile> {
    const response = await this.axios.put('/player/profile', data)
    return response.data
  }

  async saveScore(scoreData: {
    time_mode: string
    score: number
    rank: string
    remaining_time: number
    player_level: number
    items_collected: number
    monsters_defeated: number
    cleared: boolean
  }): Promise<Score> {
    const response = await this.axios.post('/scores', scoreData)
    return response.data
  }

  async getMyScores(timeMode: string): Promise<Score[]> {
    const response = await this.axios.get('/scores/my', { params: { timeMode } })
    return response.data
  }

  async getBestScore(timeMode: string): Promise<Score> {
    const response = await this.axios.get('/scores/best', { params: { timeMode } })
    return response.data
  }

  async getLeaderboard(timeMode: string, limit: number = 10): Promise<Score[]> {
    const response = await this.axios.get('/scores/leaderboard', {
      params: { timeMode, limit },
    })
    return response.data
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const response = await this.axios.get('/achievements')
    return response.data
  }

  async getMyAchievements(): Promise<Achievement[]> {
    const response = await this.axios.get('/achievements/my')
    return response.data
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    await this.axios.post('/achievements/unlock', { achievement_id: achievementId })
  }

  async getSettings(): Promise<UserSettings> {
    const response = await this.axios.get('/player/settings')
    return response.data
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await this.axios.put('/player/settings', settings)
    return response.data
  }
}

export const apiClient = new GameAPIClient()
