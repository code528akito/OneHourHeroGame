import { SkillType, SkillInstance, SkillData } from '@/models/Skill'

interface SkillBarProps {
  skills: SkillInstance[]
  skillDataMap: Map<SkillType, SkillData>
  onUseSkill: (type: SkillType) => void
}

export default function SkillBar({ skills, skillDataMap, onUseSkill }: SkillBarProps) {
  const getKeyBinding = (index: number): string => {
    return ['Q', 'E'][index] || ''
  }

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-3 border-2 border-gray-700">
        <div className="flex gap-2">
          {skills.map((skill, index) => {
            const data = skillDataMap.get(skill.type)
            if (!data) return null

            const canUse = skill.cooldownRemaining <= 0
            const cooldownPercent = data.cooldown > 0 
              ? (skill.cooldownRemaining / data.cooldown) * 100 
              : 0

            return (
              <button
                key={skill.type}
                onClick={() => canUse && onUseSkill(skill.type)}
                disabled={!canUse}
                className={`relative w-16 h-16 rounded border-2 transition-all ${
                  skill.isActive
                    ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                    : canUse
                      ? 'border-white hover:border-blue-400 hover:scale-105 cursor-pointer'
                      : 'border-gray-600 opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: data.color }}
                title={`${data.name} - ${data.description}`}
              >
                {/* キーバインド */}
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs font-bold px-1 rounded">
                  {getKeyBinding(index)}
                </div>

                {/* アクティブ時間 */}
                {skill.isActive && skill.durationRemaining > 0 && (
                  <div className="absolute top-1 right-1 bg-yellow-400 text-black text-xs font-bold px-1 rounded">
                    {Math.ceil(skill.durationRemaining)}
                  </div>
                )}

                {/* クールダウン表示 */}
                {cooldownPercent > 0 && (
                  <>
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60"
                      style={{ height: `${cooldownPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                      {Math.ceil(skill.cooldownRemaining)}
                    </div>
                  </>
                )}

                {/* スキル名（短縮） */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                  {data.name.substring(0, 2)}
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-gray-400 text-xs text-center mt-2">
          スキル: Q / E
        </div>
      </div>
    </div>
  )
}
