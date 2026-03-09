import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'

interface ClassInfo {
  id: string
  name: string
  description: string
  stats: {
    hp: string
    attack: string
    defense: string
    speed: string
  }
  skills: {
    name: string
    description: string
  }[]
  difficulty: string
  color: string
  unlocked: boolean
}

export default function ClassSelectionPage() {
  const { timeMode, setClassType, startGame } = useGameStore()
  const navigate = useNavigate()

  const classes: ClassInfo[] = [
    {
      id: 'KNIGHT',
      name: '騎士',
      description: 'バランスの取れた万能クラス。初心者にオススメ。',
      stats: {
        hp: '★★★★☆',
        attack: '★★★☆☆',
        defense: '★★★★☆',
        speed: '★★★☆☆',
      },
      skills: [
        { name: 'パワースマッシュ', description: '次の攻撃威力2倍' },
        { name: 'アイアンウォール', description: 'ダメージ50%軽減' },
      ],
      difficulty: '初級',
      color: 'bg-blue-600 hover:bg-blue-700',
      unlocked: true,
    },
    {
      id: 'MAGE',
      name: '魔法使い',
      description: '高火力の魔法攻撃。防御は低いが遠距離から攻撃可能。',
      stats: {
        hp: '★★☆☆☆',
        attack: '★★★★★',
        defense: '★☆☆☆☆',
        speed: '★★☆☆☆',
      },
      skills: [
        { name: 'ファイアボール', description: '魔法攻撃100ダメージ' },
        { name: 'サンダーボルト', description: '強力な魔法攻撃200ダメージ' },
      ],
      difficulty: '中級',
      color: 'bg-purple-600 hover:bg-purple-700',
      unlocked: true,
    },
    {
      id: 'THIEF',
      name: '盗賊',
      description: '高速移動とクリティカル攻撃。回避重視のプレイスタイル。',
      stats: {
        hp: '★★★☆☆',
        attack: '★★★★☆',
        defense: '★★☆☆☆',
        speed: '★★★★★',
      },
      skills: [
        { name: 'ファーストストライク', description: '次の攻撃が必ずクリティカル' },
        { name: 'ウィンドウォーク', description: '移動速度2倍' },
      ],
      difficulty: '中級',
      color: 'bg-green-600 hover:bg-green-700',
      unlocked: true,
    },
    {
      id: 'ARCHER',
      name: '弓使い',
      description: '超高火力の遠距離クラス。低速かつ低防御なので位置取りが重要。',
      stats: {
        hp: '★★☆☆☆',
        attack: '★★★★★',
        defense: '★☆☆☆☆',
        speed: '★☆☆☆☆',
      },
      skills: [
        { name: 'ピアシングアロー', description: '最も近い敵に遠距離160ダメージ' },
        { name: 'アローレイン', description: '遠距離の敵3体に120ダメージ' },
      ],
      difficulty: '上級',
      color: 'bg-amber-600 hover:bg-amber-700',
      unlocked: true,
    },
  ]

  const handleClassSelect = (classId: string) => {
    if (!timeMode) {
      navigate('/menu')
      return
    }

    setClassType(classId)
    startGame(timeMode)
    navigate('/game')
  }

  const handleBack = () => {
    navigate('/menu')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">クラスを選択</h1>
          <p className="text-gray-400">あなたのプレイスタイルに合ったクラスを選びましょう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {classes.map((classInfo) => (
            <div
              key={classInfo.id}
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${
                classInfo.unlocked ? 'border-gray-700' : 'border-gray-800'
              } transition-all hover:scale-105`}
            >
              <div className={`p-6 ${classInfo.unlocked ? '' : 'opacity-50'}`}>
                {/* クラス名と難易度 */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{classInfo.name}</h2>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {classInfo.difficulty}
                  </span>
                </div>

                {/* 説明 */}
                <p className="text-sm text-gray-400 mb-4">{classInfo.description}</p>

                {/* ステータス */}
                <div className="bg-gray-700 rounded p-3 mb-4">
                  <h3 className="text-sm font-bold mb-2 text-gray-300">ステータス</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">HP:</span>
                      <span>{classInfo.stats.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">攻撃力:</span>
                      <span>{classInfo.stats.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">防御力:</span>
                      <span>{classInfo.stats.defense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">移動速度:</span>
                      <span>{classInfo.stats.speed}</span>
                    </div>
                  </div>
                </div>

                {/* スキル */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold mb-2 text-gray-300">スキル</h3>
                  <div className="space-y-2">
                    {classInfo.skills.map((skill, index) => (
                      <div key={index} className="bg-gray-700 rounded p-2">
                        <div className="text-xs font-bold text-yellow-400">{skill.name}</div>
                        <div className="text-xs text-gray-400">{skill.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 選択ボタン */}
                <button
                  onClick={() => handleClassSelect(classInfo.id)}
                  disabled={!classInfo.unlocked}
                  className={`w-full py-3 rounded font-bold transition-colors ${
                    classInfo.unlocked
                      ? `${classInfo.color} text-white`
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {classInfo.unlocked ? 'このクラスで開始' : '🔒 未解放'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 戻るボタン */}
        <div className="text-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          >
            ← メニューに戻る
          </button>
        </div>

        {/* 操作説明 */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">操作方法</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">移動:</span>
              <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">WASD</span>
            </div>
            <div>
              <span className="text-gray-400">スキル1:</span>
              <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">Q</span>
            </div>
            <div>
              <span className="text-gray-400">スキル2:</span>
              <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">E</span>
            </div>
            <div>
              <span className="text-gray-400">ポーズ:</span>
              <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">ESC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
