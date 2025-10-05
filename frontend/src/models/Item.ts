export enum ItemType {
  HEALTH_POTION = 'HEALTH_POTION',
  BOMB = 'BOMB',
  HOLY_WATER = 'HOLY_WATER',
}

export enum EquipmentType {
  FLAME_SWORD = 'FLAME_SWORD',
  ICE_SHIELD = 'ICE_SHIELD',
}

export interface Vector2 {
  x: number
  y: number
}

export interface ItemData {
  type: ItemType
  name: string
  description: string
  maxStack: number
  cooldown: number
  color: string
}

export interface EquipmentData {
  type: EquipmentType
  name: string
  description: string
  attackBonus?: number
  defenseBonus?: number
  color: string
}

export interface ItemInstance {
  type: ItemType
  count: number
  cooldownRemaining: number
}

// マップ上のアイテム
export interface WorldItem {
  id: string
  type: ItemType | EquipmentType
  position: Vector2
  isEquipment: boolean
  collected: boolean
}

export class ItemSystem {
  private items: Map<ItemType, ItemInstance> = new Map()
  private itemData: Map<ItemType, ItemData> = new Map()
  private equipmentData: Map<EquipmentType, EquipmentData> = new Map()
  private equippedItems: Set<EquipmentType> = new Set()

  constructor() {
    this.initializeItemData()
    this.initializeEquipmentData()
    this.initializeInventory()
  }

  private initializeItemData(): void {
    this.itemData.set(ItemType.HEALTH_POTION, {
      type: ItemType.HEALTH_POTION,
      name: '回復ポーション',
      description: 'HPを50回復する',
      maxStack: 5,
      cooldown: 3,
      color: '#ef4444',
    })

    this.itemData.set(ItemType.BOMB, {
      type: ItemType.BOMB,
      name: 'ボム',
      description: '防御無視で50ダメージ',
      maxStack: 3,
      cooldown: 5,
      color: '#f97316',
    })

    this.itemData.set(ItemType.HOLY_WATER, {
      type: ItemType.HOLY_WATER,
      name: '聖水',
      description: '状態異常を解除',
      maxStack: 3,
      cooldown: 10,
      color: '#3b82f6',
    })
  }

  private initializeEquipmentData(): void {
    this.equipmentData.set(EquipmentType.FLAME_SWORD, {
      type: EquipmentType.FLAME_SWORD,
      name: '炎の剣',
      description: '攻撃力+10 炎属性',
      attackBonus: 10,
      color: '#ef4444',
    })

    this.equipmentData.set(EquipmentType.ICE_SHIELD, {
      type: EquipmentType.ICE_SHIELD,
      name: '氷の盾',
      description: '防御力+8 氷属性',
      defenseBonus: 8,
      color: '#3b82f6',
    })
  }

  private initializeInventory(): void {
    this.items.set(ItemType.HEALTH_POTION, {
      type: ItemType.HEALTH_POTION,
      count: 3,
      cooldownRemaining: 0,
    })

    this.items.set(ItemType.BOMB, {
      type: ItemType.BOMB,
      count: 2,
      cooldownRemaining: 0,
    })

    this.items.set(ItemType.HOLY_WATER, {
      type: ItemType.HOLY_WATER,
      count: 1,
      cooldownRemaining: 0,
    })
  }

  update(deltaTime: number): void {
    this.items.forEach(item => {
      if (item.cooldownRemaining > 0) {
        item.cooldownRemaining -= deltaTime
        if (item.cooldownRemaining < 0) {
          item.cooldownRemaining = 0
        }
      }
    })
  }

  canUseItem(type: ItemType): boolean {
    const item = this.items.get(type)
    if (!item) return false
    return item.count > 0 && item.cooldownRemaining <= 0
  }

  useItem(type: ItemType): boolean {
    if (!this.canUseItem(type)) return false

    const item = this.items.get(type)!
    const data = this.itemData.get(type)!

    item.count--
    item.cooldownRemaining = data.cooldown

    return true
  }

  addItem(type: ItemType, count: number = 1): boolean {
    const item = this.items.get(type)
    const data = this.itemData.get(type)

    if (!item || !data) return false

    const newCount = item.count + count
    if (newCount > data.maxStack) {
      item.count = data.maxStack
      return false
    }

    item.count = newCount
    return true
  }

  equipItem(type: EquipmentType): boolean {
    if (this.equippedItems.has(type)) return false
    this.equippedItems.add(type)
    console.log(`Equipped: ${this.equipmentData.get(type)?.name}`)
    return true
  }

  isEquipped(type: EquipmentType): boolean {
    return this.equippedItems.has(type)
  }

  getEquipmentBonus(): { attack: number; defense: number } {
    let attack = 0
    let defense = 0

    this.equippedItems.forEach(type => {
      const data = this.equipmentData.get(type)
      if (data) {
        attack += data.attackBonus || 0
        defense += data.defenseBonus || 0
      }
    })

    return { attack, defense }
  }

  getItem(type: ItemType): ItemInstance | null {
    return this.items.get(type) || null
  }

  getItemData(type: ItemType): ItemData | null {
    return this.itemData.get(type) || null
  }

  getEquipmentData(type: EquipmentType): EquipmentData | null {
    return this.equipmentData.get(type) || null
  }

  getAllItems(): ItemInstance[] {
    return Array.from(this.items.values())
  }

  getItemCount(type: ItemType): number {
    return this.items.get(type)?.count || 0
  }

  getEquippedItems(): EquipmentType[] {
    return Array.from(this.equippedItems)
  }
}
