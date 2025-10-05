import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import type { Achievement, UserAchievement } from '@/types'

interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlockedAt?: string
}

export default function AchievementsView() {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    setLoading(true)
    setError(null)
    try {
      const [allAchievements, myAchievements]: [Achievement[], UserAchievement[]] = await Promise.all([
        apiClient.getAllAchievements(),
        apiClient.getMyAchievements(),
      ])

      // myAchievements is UserAchievement[] now
      const myAchievementIds = new Set<string>(
        myAchievements.map((ua) => ua.achievement_id)
      )
      const myAchievementMap = new Map<string, string>(
        myAchievements.map((ua) => [ua.achievement_id, ua.unlocked_at])
      )

      const achievementsWithStatus: AchievementWithStatus[] = allAchievements.map(achievement => ({
        ...achievement,
        unlocked: myAchievementIds.has(achievement.id),
        unlockedAt: myAchievementMap.get(achievement.id),
      }))

      setAchievements(achievementsWithStatus)
    } catch (err) {
      console.error('Failed to load achievements:', err)
      setError('実績の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'CLASS_UNLOCK':
        return '🗡️'
      case 'TITLE':
        return '🏆'
      case 'HIDDEN_CONTENT':
        return '🔓'
      default:
        return '⭐'
    }
  }

  const getRewardLabel = (rewardType: string, rewardValue: string) => {
    switch (rewardType) {
      case 'CLASS_UNLOCK':
        return `クラス解放: ${rewardValue}`
      case 'TITLE':
        return `称号: ${rewardValue}`
      case 'HIDDEN_CONTENT':
        return `隠し要素: ${rewardValue}`
      default:
        return rewardValue
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">実績</h3>
        <div className="text-sm text-gray-400">
          {unlockedCount} / {totalCount} 達成
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-8 text-gray-400">実績がありません</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.unlocked
                  ? 'bg-gray-700 border-green-500 border-opacity-50'
                  : 'bg-gray-800 border-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.unlocked ? '✅' : '🔒'}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{achievement.name}</div>
                  <div className="text-sm text-gray-300 mb-2">{achievement.description}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-gray-600 px-2 py-1 rounded">
                      {getRewardIcon(achievement.reward_type)}{' '}
                      {getRewardLabel(achievement.reward_type, achievement.reward_value)}
                    </span>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span className="text-gray-400">
                        {formatDate(achievement.unlockedAt)} に達成
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
