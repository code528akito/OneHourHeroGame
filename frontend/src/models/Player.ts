import { Vector2 } from '@/types'
import { Sprite, SpriteFactory } from '@/systems/SpriteSystem'
import { ItemSystem, ItemType } from './Item'
import { SkillSystem, SkillType } from './Skill'

export interface PlayerStats {
  level: number
  hp: number
  maxHp: number
  exp: number
  maxExp: number
  attack: number
  defense: number
}

export class Player {
  private position: Vector2 = { x: 0, y: 0 }
  private velocity: Vector2 = { x: 0, y: 0 }
  private classType: string
  private speed: number = 150
  private size: number = 32
  private stats: PlayerStats
  private sprite: Sprite
  private itemSystem: ItemSystem
  private skillSystem: SkillSystem

  private keys: Set<string> = new Set()

  // スキル効果
  private powerSmashActive: boolean = false
  private ironWallActive: boolean = false
  private windWalkActive: boolean = false
  private firstStrikeActive: boolean = false

  // コールバック
  public onSkillUsed?: (skillType: string) => void
  public onMagicAttack?: (skillType: string, position: Vector2) => void

  constructor(classType: string) {
    this.classType = classType
    this.stats = this.initializeStats(classType)
    this.speed = this.getClassSpeed(classType)
    this.sprite = SpriteFactory.createPlayerSprite(classType)
    this.itemSystem = new ItemSystem()
    this.skillSystem = new SkillSystem(classType)
    this.setupInputHandlers()
  }

  private initializeStats(classType: string): PlayerStats {
    switch (classType) {
      case 'KNIGHT':
        return {
          level: 1,
          hp: 100,
          maxHp: 100,
          exp: 0,
          maxExp: 100,
          attack: 10,
          defense: 5,
        }
      case 'MAGE':
        return {
          level: 1,
          hp: 70,
          maxHp: 70,
          exp: 0,
          maxExp: 100,
          attack: 15,
          defense: 2,
        }
      case 'THIEF':
        return {
          level: 1,
          hp: 80,
          maxHp: 80,
          exp: 0,
          maxExp: 100,
          attack: 12,
          defense: 3,
        }
      default:
        return {
          level: 1,
          hp: 100,
          maxHp: 100,
          exp: 0,
          maxExp: 100,
          attack: 10,
          defense: 5,
        }
    }
  }

  private getClassSpeed(classType: string): number {
    switch (classType) {
      case 'KNIGHT':
        return 150 // 標準速度
      case 'MAGE':
        return 120 // 遅い
      case 'THIEF':
        return 180 // 速い
      default:
        return 150
    }
  }

  private setupInputHandlers(): void {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase())

    // アイテム使用
    if (e.key === '1') this.useItem(ItemType.HEALTH_POTION)
    if (e.key === '2') this.useItem(ItemType.BOMB)
    if (e.key === '3') this.useItem(ItemType.HOLY_WATER)

    // スキル使用
    const classSkills = this.skillSystem.getClassSkills()
    if (e.key.toLowerCase() === 'q' && classSkills[0]) {
      this.useSkill(classSkills[0])
    }
    if (e.key.toLowerCase() === 'e' && classSkills[1]) {
      this.useSkill(classSkills[1])
    }
  }

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase())
  }

  setPosition(x: number, y: number): void {
    this.position.x = x
    this.position.y = y
  }

  update(deltaTime: number, isWalkable?: (x: number, y: number) => boolean): void {
    this.velocity.x = 0
    this.velocity.y = 0

    if (this.keys.has('w') || this.keys.has('arrowup')) {
      this.velocity.y = -1
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      this.velocity.y = 1
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      this.velocity.x = -1
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      this.velocity.x = 1
    }

    const length = Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
    )
    if (length > 0) {
      this.velocity.x /= length
      this.velocity.y /= length
    }

    const isMoving = length > 0
    if (isMoving) {
      this.sprite.playAnimation('walk')
    } else {
      this.sprite.playAnimation('idle')
    }

    this.sprite.update(deltaTime)
    this.itemSystem.update(deltaTime)
    this.skillSystem.update(deltaTime)

    // スキル効果の更新
    this.powerSmashActive = this.skillSystem.isSkillActive(SkillType.POWER_SMASH)
    this.ironWallActive = this.skillSystem.isSkillActive(SkillType.IRON_WALL)
    this.windWalkActive = this.skillSystem.isSkillActive(SkillType.WIND_WALK)
    this.firstStrikeActive = this.skillSystem.isSkillActive(SkillType.FIRST_STRIKE)

    // 移動速度にスキル効果を適用
    let currentSpeed = this.speed
    if (this.windWalkActive) {
      currentSpeed *= 2
    }

    const newX = this.position.x + this.velocity.x * currentSpeed * deltaTime
    const newY = this.position.y + this.velocity.y * currentSpeed * deltaTime

    if (isWalkable) {
      if (isWalkable(newX, this.position.y)) {
        this.position.x = newX
      }
      if (isWalkable(this.position.x, newY)) {
        this.position.y = newY
      }
    } else {
      this.position.x = newX
      this.position.y = newY
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
    const screenX = this.position.x - cameraX
    const screenY = this.position.y - cameraY

    // スキル効果の視覚表示
    if (this.powerSmashActive) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
      ctx.beginPath()
      ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
    if (this.ironWallActive) {
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(screenX, screenY, this.size * 0.8, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (this.windWalkActive) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.beginPath()
      ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#4a9eff'
    ctx.fillRect(
      screenX - this.size / 2,
      screenY - this.size / 2,
      this.size,
      this.size
    )

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      screenX - this.size / 4,
      screenY - this.size / 4,
      this.size / 2,
      this.size / 2
    )

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(
      screenX - this.size / 2,
      screenY - this.size / 2,
      this.size,
      this.size
    )

    ctx.fillStyle = '#ffffff'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(this.classType, screenX, screenY - this.size / 2 - 5)
  }

  useItem(type: ItemType): boolean {
    if (!this.itemSystem.canUseItem(type)) return false

    if (this.itemSystem.useItem(type)) {
      switch (type) {
        case ItemType.HEALTH_POTION:
          this.heal(50)
          console.log('Used Health Potion - Healed 50 HP')
          break
        case ItemType.BOMB:
          // ボムは外部で処理
          console.log('Used Bomb - 50 damage to nearby enemies')
          break
        case ItemType.HOLY_WATER:
          console.log('Used Holy Water - Status effects removed')
          break
      }
      return true
    }
    return false
  }

  useSkill(type: SkillType): boolean {
    if (!this.skillSystem.canUseSkill(type)) return false

    if (this.skillSystem.useSkill(type)) {
      console.log(`Used skill: ${type}`)
      
      // 即時効果のスキル（魔法攻撃）
      if (type === SkillType.FIREBALL || type === SkillType.THUNDERBOLT) {
        if (this.onMagicAttack) {
          this.onMagicAttack(type, this.position)
        }
      }
      
      // コールバックを呼び出す
      if (this.onSkillUsed) {
        this.onSkillUsed(type)
      }
      
      return true
    }
    return false
  }

  addExp(amount: number): boolean {
    this.stats.exp += amount
    if (this.stats.exp >= this.stats.maxExp) {
      this.levelUp()
      return true
    }
    return false
  }

  private levelUp(): void {
    this.stats.level++
    this.stats.exp -= this.stats.maxExp
    this.stats.maxExp = Math.floor(this.stats.maxExp * 1.5)
    
    this.stats.maxHp += 10
    this.stats.hp = this.stats.maxHp
    this.stats.attack += 2
    this.stats.defense += 1

    console.log(`Level up! Now level ${this.stats.level}`)
  }

  takeDamage(damage: number): void {
    let actualDamage = Math.max(1, damage - this.getDefensePower())
    
    // アイアンウォール効果
    if (this.ironWallActive) {
      actualDamage = Math.floor(actualDamage * 0.5)
    }

    this.stats.hp -= actualDamage

    if (this.stats.hp < 0) {
      this.stats.hp = 0
    }
  }

  getAttackPower(): number {
    let attack = this.stats.attack
    
    // パワースマッシュ効果
    if (this.powerSmashActive) {
      attack *= 2
    }

    // ファーストストライク効果（クリティカル）
    if (this.firstStrikeActive) {
      attack *= 3
    }

    // 装備ボーナス
    const equipBonus = this.itemSystem.getEquipmentBonus()
    attack += equipBonus.attack

    return attack
  }

  heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.hp + amount, this.stats.maxHp)
  }

  getDefensePower(): number {
    let defense = this.stats.defense
    
    // 装備ボーナス
    const equipBonus = this.itemSystem.getEquipmentBonus()
    defense += equipBonus.defense

    return defense
  }

  isAlive(): boolean {
    return this.stats.hp > 0
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  getPosition(): Vector2 {
    return { ...this.position }
  }

  getStats(): PlayerStats {
    return { ...this.stats }
  }

  getSize(): number {
    return this.size
  }

  getClassType(): string {
    return this.classType
  }

  getItemSystem(): ItemSystem {
    return this.itemSystem
  }

  getSkillSystem(): SkillSystem {
    return this.skillSystem
  }

  // ボムのダメージを取得
  getBombDamage(): number {
    return 50
  }
}
