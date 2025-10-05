import { ItemType, ItemInstance, ItemData } from '@/models/Item'

interface ItemBarProps {
  items: ItemInstance[]
  itemDataMap: Map<ItemType, ItemData>
  onUseItem: (type: ItemType) => void
}

export default function ItemBar({ items, itemDataMap, onUseItem }: ItemBarProps) {
  const getKeyBinding = (index: number): string => {
    return ['1', '2', '3'][index] || ''
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-3 border-2 border-gray-700">
        <div className="flex gap-2">
          {items.map((item, index) => {
            const data = itemDataMap.get(item.type)
            if (!data) return null

            const canUse = item.count > 0 && item.cooldownRemaining <= 0
            const cooldownPercent = data.cooldown > 0 
              ? (item.cooldownRemaining / data.cooldown) * 100 
              : 0

            return (
              <button
                key={item.type}
                onClick={() => canUse && onUseItem(item.type)}
                disabled={!canUse}
                className={`relative w-16 h-16 rounded border-2 transition-all ${
                  canUse
                    ? 'border-white hover:border-yellow-400 hover:scale-105 cursor-pointer'
                    : 'border-gray-600 opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: data.color }}
                title={`${data.name} - ${data.description}`}
              >
                {/* アイテム数 */}
                <div className="absolute top-1 right-1 bg-black bg-opacity-75 text-white text-xs font-bold px-1 rounded">
                  {item.count}
                </div>

                {/* キーバインド */}
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs font-bold px-1 rounded">
                  {getKeyBinding(index)}
                </div>

                {/* クールダウン表示 */}
                {cooldownPercent > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-bold">
                    {Math.ceil(item.cooldownRemaining)}
                  </div>
                )}

                {/* アイテム名（短縮） */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                  {data.name.charAt(0)}
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-gray-400 text-xs text-center mt-2">
          アイテム: キー 1-3
        </div>
      </div>
    </div>
  )
}
