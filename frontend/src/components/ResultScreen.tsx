import { GameResult } from '@/systems/ScoreSystem'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { useState, useEffect, useRef } from 'react'

interface ResultScreenProps {
  result: GameResult
  onClose: () => void
}

interface UnlockedAchievement {
  id: string
  name: string
  description: string
  icon: string
}

export default function ResultScreen({ result, onClose }: ResultScreenProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([])
  const [showAchievements, setShowAchievements] = useState(false)
  const saveAttemptedRef = useRef(false) // 追加の重複防止

  // コンポーネントマウント時に状態をリセット
  useEffect(() => {
    console.log('ResultScreen mounted with result:', result)
    setSaving(false)
    setSaved(false)
    setSaveError(null)
    setUnlockedAchievements([])
    setShowAchievements(false)
    saveAttemptedRef.current = false
  }, [result])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getRankColor = (): string => {
    switch (result.rank) {
      case 'S': return 'text-yellow-400'
      case 'A': return 'text-blue-400'
      case 'B': return 'text-green-400'
      case 'C': return 'text-gray-400'
      default: return 'text-white'
    }
  }

  const getRankDescription = (): string => {
    switch (result.rank) {
      case 'S': return '完璧！真の勇者！'
      case 'A': return '素晴らしい！'
      case 'B': return 'よくできました'
      case 'C': return 'もう少し頑張ろう'
      default: return ''
    }
  }

  const handleSaveScore = async () => {
    // 重複保存を防止（複数のチェックレイヤー）
    if (saving || saved || saveAttemptedRef.current) {
      console.log('Save score button clicked but ignored:', { saving, saved, saveAttempted: saveAttemptedRef.current })
      return
    }

    console.log('=== Starting score save ===')
    saveAttemptedRef.current = true
    setSaving(true)
    setSaveError(null)
    
    try {
      // TimeModeは数値なので、そのまま文字列に変換
      const scoreData = {
        time_mode: result.timeMode.toString(),
        score: result.score,
        rank: result.rank,
        remaining_time: Math.floor(result.remainingTime),
        player_level: result.playerLevel,
        items_collected: result.itemsCollected,
        monsters_defeated: result.monstersDefeated,
        cleared: result.cleared,
      }
      
      console.log('Saving score with data:', scoreData)
      
      const response = await apiClient.saveScore(scoreData)
      
      console.log('✓ Score saved successfully!', response)
      setSaved(true)

      // 実績チェックと解放
      await checkAndUnlockAchievements()
    } catch (error: any) {
      console.error('✗ Failed to save score:', error)
      
      // リクエストが失敗した場合は再試行を許可
      saveAttemptedRef.current = false
      
      // エラーメッセージを抽出
      let errorMessage = 'スコアの保存に失敗しました'
      if (error.response) {
        const data = error.response.data
        if (data?.error) {
          errorMessage = `${data.error}`
        }
        if (data?.details) {
          errorMessage += `\n詳細: ${data.details}`
        }
        if (error.response.status) {
          errorMessage += `\n[ステータスコード: ${error.response.status}]`
        }
      } else if (error.request) {
        errorMessage = 'サーバーに接続できませんでした。ネットワーク接続を確認してください。'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setSaveError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const checkAndUnlockAchievements = async () => {
    console.log('Checking achievements...')
    const newUnlockedAchievements: UnlockedAchievement[] = []

    try {
      // 初回クリア（cleared が true）
      if (result.cleared) {
        try {
          await apiClient.unlockAchievement('first_clear')
          newUnlockedAchievements.push({
            id: 'first_clear',
            name: '初めてのクリア',
            description: 'ゲームを初めてクリアした',
            icon: '🎉',
          })
        } catch (error) {
          console.log('Achievement first_clear already unlocked or failed')
        }
      }

      // スピードランナー（5分以内）
      if (result.timeMode === 300 && result.cleared) {
        try {
          await apiClient.unlockAchievement('speed_runner')
          newUnlockedAchievements.push({
            id: 'speed_runner',
            name: 'スピードランナー',
            description: '5分以内にクリア',
            icon: '⚡',
          })
        } catch (error) {
          console.log('Achievement speed_runner already unlocked or failed')
        }
      }

      // モンスターハンター（10体以上）
      if (result.monstersDefeated >= 10) {
        try {
          await apiClient.unlockAchievement('monster_hunter')
          newUnlockedAchievements.push({
            id: 'monster_hunter',
            name: 'モンスターハンター',
            description: '10体以上のモンスターを倒す',
            icon: '⚔️',
          })
        } catch (error) {
          console.log('Achievement monster_hunter already unlocked or failed')
        }
      }

      // レベルマスター（レベル10以上）
      if (result.playerLevel >= 10) {
        try {
          await apiClient.unlockAchievement('level_master')
          newUnlockedAchievements.push({
            id: 'level_master',
            name: 'レベルマスター',
            description: 'レベル10に到達',
            icon: '⭐',
          })
        } catch (error) {
          console.log('Achievement level_master already unlocked or failed')
        }
      }

      // Sランク
      if (result.rank === 'S') {
        try {
          await apiClient.unlockAchievement('rank_s')
          newUnlockedAchievements.push({
            id: 'rank_s',
            name: 'Sランク獲得',
            description: 'Sランクを獲得',
            icon: '🏆',
          })
        } catch (error) {
          console.log('Achievement rank_s already unlocked or failed')
        }
      }

      // アイテムコレクター（5個以上）
      if (result.itemsCollected >= 5) {
        try {
          await apiClient.unlockAchievement('item_collector')
          newUnlockedAchievements.push({
            id: 'item_collector',
            name: 'アイテムコレクター',
            description: 'アイテムを5個以上収集',
            icon: '🎁',
          })
        } catch (error) {
          console.log('Achievement item_collector already unlocked or failed')
        }
      }

      if (newUnlockedAchievements.length > 0) {
        setUnlockedAchievements(newUnlockedAchievements)
        setShowAchievements(true)
        console.log('Unlocked achievements:', newUnlockedAchievements)
      }
    } catch (error) {
      console.error('Failed to check achievements:', error)
    }
  }

  const handleBackToMenu = () => {
    onClose()
    navigate('/menu')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 border-4 border-gray-700">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            {result.cleared ? (
              <span className="text-green-400">クリア！</span>
            ) : (
              <span className="text-red-400">タイムアップ</span>
            )}
          </h1>
          
          <div className={`text-8xl font-bold mb-2 ${getRankColor()}`}>
            {result.rank}
          </div>
          
          <div className="text-2xl text-gray-400 mb-4">
            {getRankDescription()}
          </div>
        </div>

        {/* スコア */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-gray-400 text-sm mb-1">スコア</div>
            <div className="text-5xl font-bold text-yellow-400">
              {result.score.toLocaleString()}
            </div>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-400 text-xs mb-1">残り時間</div>
              <div className="text-2xl font-bold text-green-400">
                {formatTime(result.remainingTime)}
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-400 text-xs mb-1">最終レベル</div>
              <div className="text-2xl font-bold text-blue-400">
                Lv.{result.playerLevel}
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-400 text-xs mb-1">倒したモンスター</div>
              <div className="text-2xl font-bold text-red-400">
                {result.monstersDefeated}体
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-400 text-xs mb-1">収集アイテム</div>
              <div className="text-2xl font-bold text-purple-400">
                {result.itemsCollected}個
              </div>
            </div>
          </div>
        </div>

        {/* 実績解放アニメーション */}
        {showAchievements && unlockedAchievements.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-xl font-bold text-yellow-400 mb-3 text-center">
              🎉 実績解放！
            </h3>
            {unlockedAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-r from-yellow-900 to-yellow-700 border-2 border-yellow-500 rounded-lg p-4 animate-pulse"
                style={{
                  animation: `slideIn 0.5s ease-out ${index * 0.2}s both`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{achievement.name}</div>
                    <div className="text-sm text-yellow-200">{achievement.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ボタン */}
        <div className="flex flex-col gap-4">
          {/* エラーメッセージ */}
          {saveError && (
            <div className="bg-red-900 border border-red-600 text-red-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
              ⚠️ {saveError}
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={handleSaveScore}
              disabled={saving || saved}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                saved
                  ? 'bg-green-600 text-white cursor-default'
                  : saving
                    ? 'bg-gray-600 text-gray-400 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saved ? '✓ 保存済み' : saving ? '保存中...' : 'スコアを保存'}
            </button>

            <button
              onClick={handleBackToMenu}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
