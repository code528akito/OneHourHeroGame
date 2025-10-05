import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'
import { TimeMode } from '@/types'
import LeaderboardView from './LeaderboardView'
import AchievementsView from './AchievementsView'
import SettingsView from './SettingsView'

export default function MainMenuPage() {
  const { user, logout, startGame } = useGameStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements' | 'settings'>(
    'leaderboard'
  )

  const handleModeSelect = (mode: TimeMode) => {
    startGame(mode)
    navigate('/class-selection')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const timeModes = [
    { mode: TimeMode.ONE_MINUTE, label: '1分モード', goal: '村の周りでスライムを倒す' },
    {
      mode: TimeMode.FIVE_MINUTES,
      label: '5分モード',
      goal: '森の奥の「炎の剣」を手に入れる',
    },
    {
      mode: TimeMode.TEN_MINUTES,
      label: '10分モード',
      goal: '森のミニボス「古のトレント」を倒す',
    },
    { mode: TimeMode.THIRTY_MINUTES, label: '30分モード', goal: '魔王城の門番を倒す' },
    { mode: TimeMode.SIXTY_MINUTES, label: '60分モード', goal: '魔王を倒す' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">ワンアワー・ヒーロー</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">ようこそ、{user?.username}さん</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">時間モードを選択</h2>
            <div className="space-y-3">
              {timeModes.map(({ mode, label, goal }) => (
                <button
                  key={mode}
                  onClick={() => handleModeSelect(mode)}
                  className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <div className="font-bold text-lg">{label}</div>
                  <div className="text-sm text-gray-400 mt-1">目標: {goal}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* タブ */}
            <div className="bg-gray-800 rounded-lg">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex-1 py-3 font-medium transition-colors ${
                    activeTab === 'leaderboard'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  リーダーボード
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex-1 py-3 font-medium transition-colors ${
                    activeTab === 'achievements'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  実績
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-3 font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  設定
                </button>
              </div>

              {/* タブコンテンツ */}
              <div className="p-6">
                {activeTab === 'leaderboard' && <LeaderboardView />}
                {activeTab === 'achievements' && <AchievementsView />}
                {activeTab === 'settings' && <SettingsView />}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">ゲームについて</h2>
          <p className="text-gray-300 leading-relaxed">
            世界の滅亡まで残り60分！限られた時間の中で魔王を倒すことができるか？
            <br />
            効率的なルート選択、情報収集、戦闘を行い、最速クリアを目指しましょう。
            <br />
            繰り返しプレイすることで最適な攻略法を見つけ出し、ハイスコアを目指せ！
          </p>
        </div>
      </div>
    </div>
  )
}
