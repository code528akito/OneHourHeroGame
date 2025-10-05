import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/api/client'
import { Score, TimeMode } from '@/types'
import { useGameStore } from '@/stores/gameStore'

const TIME_MODE_LABELS: Record<number, string> = {
  [TimeMode.ONE_MINUTE]: '1分',
  [TimeMode.FIVE_MINUTES]: '5分',
  [TimeMode.TEN_MINUTES]: '10分',
  [TimeMode.THIRTY_MINUTES]: '30分',
  [TimeMode.SIXTY_MINUTES]: '60分',
}

export default function LeaderboardView() {
  const { user } = useGameStore()
  const [selectedMode, setSelectedMode] = useState<TimeMode>(TimeMode.SIXTY_MINUTES)
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getLeaderboard(selectedMode.toString(), 10)
      setScores(data)
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
      setError('リーダーボードの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [selectedMode])

  useEffect(() => {
    loadLeaderboard()
  }, [selectedMode, loadLeaderboard])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">リーダーボード</h3>

      {/* モード選択タブ */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.values(TimeMode)
          .filter(v => typeof v === 'number')
          .map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode as TimeMode)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {TIME_MODE_LABELS[mode as number]}
            </button>
          ))}
      </div>

      {/* スコア一覧 */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-8 text-gray-400">まだスコアがありません</div>
      ) : (
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div
              key={score.id}
              className={`p-3 rounded flex items-center justify-between ${
                score.user_id === user?.id
                  ? 'bg-blue-900 bg-opacity-30 border border-blue-500'
                  : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded font-bold ${
                    index === 0
                      ? 'bg-yellow-500 text-gray-900'
                      : index === 1
                      ? 'bg-gray-400 text-gray-900'
                      : index === 2
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{score.user?.username || 'Unknown'}</div>
                  <div className="text-xs text-gray-400">{formatDate(score.created_at)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-lg">{score.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    Lv.{score.player_level} | {formatTime(score.remaining_time)}残
                  </div>
                </div>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded font-bold text-xl ${
                    score.rank === 'S'
                      ? 'bg-yellow-500 text-gray-900'
                      : score.rank === 'A'
                      ? 'bg-green-500 text-white'
                      : score.rank === 'B'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {score.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
