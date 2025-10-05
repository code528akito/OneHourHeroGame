import { Vector2 } from '@/types'

export enum EffectType {
  DAMAGE_TEXT = 'DAMAGE_TEXT',
  HEAL_TEXT = 'HEAL_TEXT',
  LEVEL_UP = 'LEVEL_UP',
  HIT_FLASH = 'HIT_FLASH',
  SKILL_AURA = 'SKILL_AURA',
  ITEM_PICKUP = 'ITEM_PICKUP',
  EXPLOSION = 'EXPLOSION',
}

export interface Effect {
  id: string
  type: EffectType
  position: Vector2
  lifetime: number
  maxLifetime: number
  data?: Record<string, unknown>
}

// ダメージテキストエフェクト
export interface DamageTextEffect extends Effect {
  type: EffectType.DAMAGE_TEXT | EffectType.HEAL_TEXT
  data: {
    value: number
    color: string
    velocity: Vector2
  }
}

// ヒットフラッシュエフェクト
export interface HitFlashEffect extends Effect {
  type: EffectType.HIT_FLASH
  data: {
    radius: number
    color: string
  }
}

// レベルアップエフェクト
export interface LevelUpEffect extends Effect {
  type: EffectType.LEVEL_UP
  data: {
    radius: number
  }
}

// スキルオーラエフェクト
export interface SkillAuraEffect extends Effect {
  type: EffectType.SKILL_AURA
  data: {
    radius: number
    color: string
  }
}

// アイテムピックアップエフェクト
export interface ItemPickupEffect extends Effect {
  type: EffectType.ITEM_PICKUP
  data: {
    itemName: string
    color: string
  }
}

// 爆発エフェクト
export interface ExplosionEffect extends Effect {
  type: EffectType.EXPLOSION
  data: {
    radius: number
    maxRadius: number
  }
}

export class EffectSystem {
  private effects: Effect[] = []
  private nextId: number = 0

  update(deltaTime: number): void {
    // エフェクトの更新
    this.effects.forEach(effect => {
      effect.lifetime -= deltaTime

      // ダメージテキストの移動
      if (effect.type === EffectType.DAMAGE_TEXT || effect.type === EffectType.HEAL_TEXT) {
        const damageEffect = effect as DamageTextEffect
        damageEffect.position.x += damageEffect.data.velocity.x * deltaTime
        damageEffect.position.y += damageEffect.data.velocity.y * deltaTime
        // 重力効果
        damageEffect.data.velocity.y += 150 * deltaTime
      }

      // レベルアップエフェクトの拡大
      if (effect.type === EffectType.LEVEL_UP) {
        const levelUpEffect = effect as LevelUpEffect
        const progress = 1 - (effect.lifetime / effect.maxLifetime)
        levelUpEffect.data.radius = 20 + progress * 60
      }

      // 爆発エフェクトの拡大
      if (effect.type === EffectType.EXPLOSION) {
        const explosionEffect = effect as ExplosionEffect
        const progress = 1 - (effect.lifetime / effect.maxLifetime)
        explosionEffect.data.radius = progress * explosionEffect.data.maxRadius
      }
    })

    // 寿命が尽きたエフェクトを削除
    this.effects = this.effects.filter(effect => effect.lifetime > 0)
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
    this.effects.forEach(effect => {
      const screenX = effect.position.x - cameraX
      const screenY = effect.position.y - cameraY
      const alpha = effect.lifetime / effect.maxLifetime

      ctx.save()
      ctx.globalAlpha = alpha

      switch (effect.type) {
        case EffectType.DAMAGE_TEXT:
        case EffectType.HEAL_TEXT:
          this.renderDamageText(ctx, effect as DamageTextEffect, screenX, screenY, alpha)
          break
        case EffectType.HIT_FLASH:
          this.renderHitFlash(ctx, effect as HitFlashEffect, screenX, screenY, alpha)
          break
        case EffectType.LEVEL_UP:
          this.renderLevelUp(ctx, effect as LevelUpEffect, screenX, screenY, alpha)
          break
        case EffectType.SKILL_AURA:
          this.renderSkillAura(ctx, effect as SkillAuraEffect, screenX, screenY, alpha)
          break
        case EffectType.ITEM_PICKUP:
          this.renderItemPickup(ctx, effect as ItemPickupEffect, screenX, screenY, alpha)
          break
        case EffectType.EXPLOSION:
          this.renderExplosion(ctx, effect as ExplosionEffect, screenX, screenY, alpha)
          break
      }

      ctx.restore()
    })
  }

  private renderDamageText(
    ctx: CanvasRenderingContext2D,
    effect: DamageTextEffect,
    x: number,
    y: number,
    _alpha: number
  ): void {
    ctx.fillStyle = effect.data.color
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const text = effect.data.value.toString()
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }

  private renderHitFlash(
    ctx: CanvasRenderingContext2D,
    effect: HitFlashEffect,
    x: number,
    y: number,
    _alpha: number
  ): void {
    ctx.fillStyle = effect.data.color
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  private renderLevelUp(
    ctx: CanvasRenderingContext2D,
    effect: LevelUpEffect,
    x: number,
    y: number,
    _alpha: number
  ): void {
    // 外側のリング
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius, 0, Math.PI * 2)
    ctx.stroke()

    // 内側のリング
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius * 0.7, 0, Math.PI * 2)
    ctx.stroke()

    // 星形エフェクト
    const starPoints = 8
    for (let i = 0; i < starPoints; i++) {
      const angle = (Math.PI * 2 * i) / starPoints
      const length = effect.data.radius * 0.5
      const endX = x + Math.cos(angle) * length
      const endY = y + Math.sin(angle) * length

      ctx.strokeStyle = '#fef3c7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    }

    // テキスト
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('LEVEL UP!', x, y - effect.data.radius - 10)
  }

  private renderSkillAura(
    ctx: CanvasRenderingContext2D,
    effect: SkillAuraEffect,
    x: number,
    y: number,
    alpha: number
  ): void {
    ctx.strokeStyle = effect.data.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius, 0, Math.PI * 2)
    ctx.stroke()

    // 内側の円
    ctx.globalAlpha = alpha * 0.3
    ctx.fillStyle = effect.data.color
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius * 0.8, 0, Math.PI * 2)
    ctx.fill()
  }

  private renderItemPickup(
    ctx: CanvasRenderingContext2D,
    effect: ItemPickupEffect,
    x: number,
    y: number,
    alpha: number
  ): void {
    ctx.fillStyle = effect.data.color
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const yOffset = (1 - alpha) * -30
    ctx.fillText(`+${effect.data.itemName}`, x, y + yOffset)
  }

  private renderExplosion(
    ctx: CanvasRenderingContext2D,
    effect: ExplosionEffect,
    x: number,
    y: number,
    alpha: number
  ): void {
    // 外側の円（オレンジ）
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius, 0, Math.PI * 2)
    ctx.fill()

    // 内側の円（黄色）
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius * 0.6, 0, Math.PI * 2)
    ctx.fill()

    // 中心の円（白）
    ctx.globalAlpha = alpha * 0.8
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, effect.data.radius * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  // エフェクト追加メソッド
  addDamageText(position: Vector2, damage: number, isCritical: boolean = false): void {
    const effect: DamageTextEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.DAMAGE_TEXT,
      position: { ...position },
      lifetime: 1.0,
      maxLifetime: 1.0,
      data: {
        value: damage,
        color: isCritical ? '#fbbf24' : '#ef4444',
        velocity: { x: (Math.random() - 0.5) * 30, y: -120 },
      },
    }
    this.effects.push(effect)
  }

  addHealText(position: Vector2, heal: number): void {
    const effect: DamageTextEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.HEAL_TEXT,
      position: { ...position },
      lifetime: 1.0,
      maxLifetime: 1.0,
      data: {
        value: heal,
        color: '#22c55e',
        velocity: { x: (Math.random() - 0.5) * 30, y: -120 },
      },
    }
    this.effects.push(effect)
  }

  addHitFlash(position: Vector2, isPlayer: boolean = false): void {
    const effect: HitFlashEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.HIT_FLASH,
      position: { ...position },
      lifetime: 0.2,
      maxLifetime: 0.2,
      data: {
        radius: 20,
        color: isPlayer ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.5)',
      },
    }
    this.effects.push(effect)
  }

  addLevelUpEffect(position: Vector2): void {
    const effect: LevelUpEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.LEVEL_UP,
      position: { ...position },
      lifetime: 1.5,
      maxLifetime: 1.5,
      data: {
        radius: 20,
      },
    }
    this.effects.push(effect)
  }

  addSkillAura(position: Vector2, color: string, duration: number = 0.5): void {
    const effect: SkillAuraEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.SKILL_AURA,
      position: { ...position },
      lifetime: duration,
      maxLifetime: duration,
      data: {
        radius: 40,
        color,
      },
    }
    this.effects.push(effect)
  }

  addItemPickup(position: Vector2, itemName: string, color: string): void {
    const effect: ItemPickupEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.ITEM_PICKUP,
      position: { ...position },
      lifetime: 1.5,
      maxLifetime: 1.5,
      data: {
        itemName,
        color,
      },
    }
    this.effects.push(effect)
  }

  addExplosion(position: Vector2, radius: number = 100): void {
    const effect: ExplosionEffect = {
      id: `effect_${this.nextId++}`,
      type: EffectType.EXPLOSION,
      position: { ...position },
      lifetime: 0.5,
      maxLifetime: 0.5,
      data: {
        radius: 0,
        maxRadius: radius,
      },
    }
    this.effects.push(effect)
  }

  clearEffects(): void {
    this.effects = []
  }

  getEffectCount(): number {
    return this.effects.length
  }
}
