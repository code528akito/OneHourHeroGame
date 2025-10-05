import { Vector2 } from '@/types'
import { Sprite, SpriteFactory } from '@/systems/SpriteSystem'

export enum MonsterType {
  // 序盤エリア
  SLIME = 'SLIME',
  GOBLIN = 'GOBLIN',
  WOLF = 'WOLF',
  TRENT = 'TRENT',
  
  // 中盤エリア（クリスタルの洞窟）
  ROCK_GOLEM = 'ROCK_GOLEM',
  GIANT_BAT = 'GIANT_BAT',
  CRYSTAL_LIZARD = 'CRYSTAL_LIZARD',
  
  // 終盤エリア（灼熱火山・魔王城）
  HELLHOUND = 'HELLHOUND',
  ROYAL_GUARD = 'ROYAL_GUARD',
  DEMON_LORD = 'DEMON_LORD',
  
  DRAGON = 'DRAGON',
}

export enum AIType {
  PASSIVE = 'PASSIVE',      // スライム: 動かない
  AGGRESSIVE = 'AGGRESSIVE', // ゴブリン: プレイヤーに近づく
  FAST_ATTACK = 'FAST_ATTACK', // 森のオオカミ、ジャイアントバット: 素早い攻撃
  HIGH_DEFENSE = 'HIGH_DEFENSE', // ロックゴーレム: 高防御力
  BOSS = 'BOSS',            // ボス: 特殊な行動パターン
}

export interface MonsterStats {
  hp: number
  maxHp: number
  attack: number
  defense: number
  exp: number
  level: number
}

export class Monster {
  private position: Vector2
  private velocity: Vector2 = { x: 0, y: 0 }
  private type: MonsterType
  private stats: MonsterStats
  private sprite: Sprite
  private size: number = 32
  private speed: number = 50
  private aiType: AIType
  private isAlive: boolean = true
  private moveTimer: number = 0
  private moveDirection: Vector2 = { x: 0, y: 0 }
  private aggroRange: number = 200

  constructor(type: MonsterType, x: number, y: number) {
    this.type = type
    this.position = { x, y }
    this.stats = this.initializeStats(type)
    this.aiType = this.getAIType(type)
    this.sprite = SpriteFactory.createMonsterSprite(type)
    
    // AIタイプに応じて速度を調整
    if (this.aiType === AIType.FAST_ATTACK) {
      this.speed = 80
    } else if (this.aiType === AIType.HIGH_DEFENSE) {
      this.speed = 30
    }
  }

  private getAIType(type: MonsterType): AIType {
    switch (type) {
      case MonsterType.SLIME:
        return AIType.PASSIVE
      case MonsterType.GOBLIN:
        return AIType.AGGRESSIVE
      case MonsterType.WOLF:
      case MonsterType.GIANT_BAT:
        return AIType.FAST_ATTACK
      case MonsterType.ROCK_GOLEM:
        return AIType.HIGH_DEFENSE
      case MonsterType.HELLHOUND:
        return AIType.FAST_ATTACK
      case MonsterType.ROYAL_GUARD:
        return AIType.HIGH_DEFENSE
      case MonsterType.TRENT:
      case MonsterType.CRYSTAL_LIZARD:
      case MonsterType.DEMON_LORD:
      case MonsterType.DRAGON:
        return AIType.BOSS
      default:
        return AIType.PASSIVE
    }
  }

  private initializeStats(type: MonsterType): MonsterStats {
    switch (type) {
      case MonsterType.SLIME:
        // 最弱、経験値稼ぎ用
        return {
          hp: 15,
          maxHp: 15,
          attack: 3,
          defense: 1,
          exp: 8,
          level: 1,
        }
      case MonsterType.GOBLIN:
        // 集団で出現、中程度の強さ
        return {
          hp: 30,
          maxHp: 30,
          attack: 6,
          defense: 2,
          exp: 20,
          level: 3,
        }
      case MonsterType.WOLF:
        // 森のオオカミ: 素早い攻撃、高攻撃力
        return {
          hp: 40,
          maxHp: 40,
          attack: 10,
          defense: 3,
          exp: 35,
          level: 4,
        }
      case MonsterType.TRENT:
        // 古のトレント: ミニボス、高HP・高防御
        return {
          hp: 150,
          maxHp: 150,
          attack: 15,
          defense: 10,
          exp: 200,
          level: 8,
        }
      
      // 中盤エリア（クリスタルの洞窟）
      case MonsterType.ROCK_GOLEM:
        // ロックゴーレム: 高防御力、低速
        return {
          hp: 80,
          maxHp: 80,
          attack: 12,
          defense: 15,
          exp: 60,
          level: 6,
        }
      case MonsterType.GIANT_BAT:
        // ジャイアントバット: 素早い、低HP
        return {
          hp: 35,
          maxHp: 35,
          attack: 14,
          defense: 2,
          exp: 45,
          level: 5,
        }
      case MonsterType.CRYSTAL_LIZARD:
        // クリスタル・リザード: ミニボス、バランス型
        return {
          hp: 200,
          maxHp: 200,
          attack: 20,
          defense: 12,
          exp: 300,
          level: 10,
        }
      
      // 終盤エリア（灼熱火山・魔王城）
      case MonsterType.HELLHOUND:
        // ヘルハウンド: 継続ダメージ、素早い
        return {
          hp: 60,
          maxHp: 60,
          attack: 18,
          defense: 5,
          exp: 80,
          level: 8,
        }
      case MonsterType.ROYAL_GUARD:
        // 魔王軍・近衛騎士: 高ステータス全般
        return {
          hp: 120,
          maxHp: 120,
          attack: 25,
          defense: 18,
          exp: 150,
          level: 12,
        }
      case MonsterType.DEMON_LORD:
        // 魔王: 最終ボス、3形態
        return {
          hp: 500,
          maxHp: 500,
          attack: 40,
          defense: 20,
          exp: 1000,
          level: 20,
        }
      
      case MonsterType.DRAGON:
        // 最終ボス級
        return {
          hp: 300,
          maxHp: 300,
          attack: 30,
          defense: 15,
          exp: 500,
          level: 15,
        }
      default:
        return {
          hp: 10,
          maxHp: 10,
          attack: 2,
          defense: 1,
          exp: 5,
          level: 1,
        }
    }
  }

  update(deltaTime: number, playerPos: Vector2): void {
    if (!this.isAlive) return

    this.sprite.update(deltaTime)

    // AIタイプに基づいた移動
    switch (this.aiType) {
      case AIType.PASSIVE:
        // スライム: 動かない
        break
      case AIType.AGGRESSIVE:
        // ゴブリン: プレイヤーに近づく
        this.moveTowardsPlayer(deltaTime, playerPos)
        break
      case AIType.FAST_ATTACK:
        // オオカミ、ジャイアントバット: 素早くプレイヤーに近づく
        this.moveTowardsPlayer(deltaTime, playerPos, 2.0)
        break
      case AIType.HIGH_DEFENSE:
        // ロックゴーレム: ゆっくりプレイヤーに近づく
        this.moveTowardsPlayer(deltaTime, playerPos, 0.6)
        break
      case AIType.BOSS:
        // ボス: ランダム移動（将来的により複雑なパターンに）
        this.randomMove(deltaTime)
        break
    }
  }

  private moveTowardsPlayer(deltaTime: number, playerPos: Vector2, speedMultiplier: number = 1.0): void {
    const distance = this.distanceTo(playerPos)
    
    // アグロ範囲内にプレイヤーがいる場合のみ移動
    if (distance < this.aggroRange && distance > 20) {
      const dx = playerPos.x - this.position.x
      const dy = playerPos.y - this.position.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      if (length > 0) {
        this.moveDirection = {
          x: dx / length,
          y: dy / length,
        }
        
        this.position.x += this.moveDirection.x * this.speed * speedMultiplier * deltaTime
        this.position.y += this.moveDirection.y * this.speed * speedMultiplier * deltaTime
      }
    }
  }

  private randomMove(deltaTime: number): void {
    this.moveTimer += deltaTime
    if (this.moveTimer >= 2) {
      this.moveTimer = 0
      this.moveDirection = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      }

      const length = Math.sqrt(
        this.moveDirection.x * this.moveDirection.x + this.moveDirection.y * this.moveDirection.y
      )
      if (length > 0) {
        this.moveDirection.x /= length
        this.moveDirection.y /= length
      }
    }

    this.position.x += this.moveDirection.x * this.speed * deltaTime
    this.position.y += this.moveDirection.y * this.speed * deltaTime
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
    if (!this.isAlive) return

    const screenX = this.position.x - cameraX
    const screenY = this.position.y - cameraY

    const color = this.getMonsterColor()
    ctx.fillStyle = color
    ctx.fillRect(
      screenX - this.size / 2,
      screenY - this.size / 2,
      this.size,
      this.size
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
    const displayName = this.getDisplayName()
    ctx.fillText(displayName, screenX, screenY - this.size / 2 - 5)

    this.renderHealthBar(ctx, screenX, screenY)
  }

  private getDisplayName(): string {
    switch (this.type) {
      case MonsterType.ROCK_GOLEM:
        return 'GOLEM'
      case MonsterType.GIANT_BAT:
        return 'BAT'
      case MonsterType.CRYSTAL_LIZARD:
        return 'C.LIZARD'
      case MonsterType.HELLHOUND:
        return 'HOUND'
      case MonsterType.ROYAL_GUARD:
        return 'GUARD'
      case MonsterType.DEMON_LORD:
        return 'DEMON'
      default:
        return this.type
    }
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const barWidth = this.size
    const barHeight = 4
    const barY = y + this.size / 2 + 5

    ctx.fillStyle = '#ff0000'
    ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight)

    const hpPercent = this.stats.hp / this.stats.maxHp
    ctx.fillStyle = '#00ff00'
    ctx.fillRect(x - barWidth / 2, barY, barWidth * hpPercent, barHeight)

    ctx.strokeStyle = '#000000'
    ctx.strokeRect(x - barWidth / 2, barY, barWidth, barHeight)
  }

  private getMonsterColor(): string {
    switch (this.type) {
      case MonsterType.SLIME:
        return '#22c55e' // 緑
      case MonsterType.GOBLIN:
        return '#ef4444' // 赤
      case MonsterType.WOLF:
        return '#78716c' // グレー
      case MonsterType.TRENT:
        return '#16a34a' // 濃い緑
      case MonsterType.ROCK_GOLEM:
        return '#57534e' // 石色（茶灰色）
      case MonsterType.GIANT_BAT:
        return '#1e1b4b' // 濃い紫
      case MonsterType.CRYSTAL_LIZARD:
        return '#06b6d4' // シアン（クリスタル色）
      case MonsterType.HELLHOUND:
        return '#dc2626' // 赤（火）
      case MonsterType.ROYAL_GUARD:
        return '#6b21a8' // 濃い紫（魔王軍）
      case MonsterType.DEMON_LORD:
        return '#7c2d12' // 暗い赤（魔王）
      case MonsterType.DRAGON:
        return '#8b5cf6' // 紫
      default:
        return '#6b7280'
    }
  }

  takeDamage(damage: number): void {
    const actualDamage = Math.max(1, damage - this.stats.defense)
    this.stats.hp -= actualDamage

    if (this.stats.hp <= 0) {
      this.stats.hp = 0
      this.isAlive = false
    }
  }

  getPosition(): Vector2 {
    return { ...this.position }
  }

  getStats(): MonsterStats {
    return { ...this.stats }
  }

  getType(): MonsterType {
    return this.type
  }

  isMonsterAlive(): boolean {
    return this.isAlive
  }

  getSize(): number {
    return this.size
  }

  distanceTo(pos: Vector2): number {
    const dx = this.position.x - pos.x
    const dy = this.position.y - pos.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  getCurrentAIType(): AIType {
    return this.aiType
  }

  setPosition(pos: Vector2): void {
    this.position = { ...pos }
  }
}
