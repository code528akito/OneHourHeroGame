interface GameHUDProps {
  playerLevel: number
  playerHp: number
  playerMaxHp: number
  playerExp: number
  playerMaxExp: number
  playerClass: string
}

export default function GameHUD({
  playerLevel,
  playerHp,
  playerMaxHp,
  playerExp,
  playerMaxExp,
  playerClass,
}: GameHUDProps) {
  const hpPercent = (playerHp / playerMaxHp) * 100
  const expPercent = (playerExp / playerMaxExp) * 100

  return (
    <div className="fixed top-4 left-4 z-10">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-gray-700 min-w-[250px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-bold">Lv.{playerLevel}</span>
          <span className="text-gray-400 text-sm">{playerClass}</span>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>HP</span>
              <span>
                {playerHp} / {playerMaxHp}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>EXP</span>
              <span>
                {playerExp} / {playerMaxExp}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
