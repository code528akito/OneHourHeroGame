import { TimeMode, GameState } from '@/types'
import { GameStateManager } from './GameStateManager'
import { TimerSystem } from './TimerSystem'
import { MapSystem, Camera } from './MapSystem'
import { ScoreSystem, GameResult } from './ScoreSystem'
import { EffectSystem } from './EffectSystem'
import { Player } from '@/models/Player'
import { Monster, MonsterType } from '@/models/Monster'
import { ItemType, EquipmentType } from '@/models/Item'
import { NPC, Monument } from '@/models/NPC'

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private stateManager: GameStateManager
  private timerSystem: TimerSystem
  private scoreSystem: ScoreSystem
  private effectSystem: EffectSystem
  private mapSystem: MapSystem | null = null
  private camera: Camera | null = null
  private player: Player | null = null
  private monsters: Monster[] = []
  private lastFrameTime: number = 0
  private animationFrameId: number | null = null
  private timeMode: TimeMode | null = null

  // ゲーム統計
  private monstersDefeated: number = 0
  private itemsCollected: number = 0

  // NPC会話と石碑調査の状態
  private activeNPC: NPC | null = null
  private activeMonument: Monument | null = null
  private isDialogOpen: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get 2D context')
    }
    this.ctx = context

    this.stateManager = new GameStateManager()
    this.timerSystem = new TimerSystem()
    this.scoreSystem = new ScoreSystem()
    this.effectSystem = new EffectSystem()

    this.setupCanvas()
    this.setupEventListeners()
  }

  private setupCanvas(): void {
    this.canvas.width = 800
    this.canvas.height = 600
    this.ctx.imageSmoothingEnabled = false
  }

  private setupEventListeners(): void {
    this.timerSystem.onTimeUp(() => {
      this.handleTimeUp()
    })
  }

  startGame(timeMode: TimeMode, classType: string): void {
    console.log(`Starting game: ${timeMode}s, class: ${classType}`)
    
    this.timeMode = timeMode
    this.monstersDefeated = 0
    this.itemsCollected = 0
    
    this.mapSystem = new MapSystem(50, 50, 32)
    const worldSize = this.mapSystem.getWorldSize()
    this.camera = new Camera(this.canvas.width, this.canvas.height, worldSize.x, worldSize.y)
    
    this.player = new Player(classType)
    const centerX = worldSize.x / 2
    const centerY = worldSize.y / 2
    this.player.setPosition(centerX, centerY)
    
    // プレイヤーのスキル使用コールバックを設定
    this.player.onSkillUsed = (skillType: string) => {
      this.handleSkillUsed(skillType)
    }
    
    // 魔法攻撃コールバックを設定
    this.player.onMagicAttack = (skillType: string, position: { x: number; y: number }) => {
      this.handleMagicAttack(skillType, position)
    }
    
    this.spawnMonsters()
    
    this.stateManager.changeState(GameState.PLAYING)
    this.timerSystem.start(timeMode)
    
    this.lastFrameTime = performance.now()
    this.gameLoop(this.lastFrameTime)
  }

  private handleSkillUsed(skillType: string): void {
    if (!this.player) return
    
    const playerPos = this.player.getPosition()
    
    // スキル別のエフェクト
    switch (skillType) {
      case 'POWER_SMASH':
        this.effectSystem.addSkillAura(playerPos, '#ef4444', 0.5)
        break
      case 'IRON_WALL':
        this.effectSystem.addSkillAura(playerPos, '#6b7280', 1.0)
        break
      case 'WIND_WALK':
        this.effectSystem.addSkillAura(playerPos, '#06b6d4', 1.5)
        break
      case 'FIREBALL':
        this.effectSystem.addSkillAura(playerPos, '#f97316', 0.8)
        break
      case 'THUNDERBOLT':
        this.effectSystem.addSkillAura(playerPos, '#fbbf24', 0.8)
        break
      case 'FIRST_STRIKE':
        this.effectSystem.addSkillAura(playerPos, '#8b5cf6', 0.5)
        break
    }
  }

  private handleMagicAttack(skillType: string, position: { x: number; y: number }): void {
    if (!this.player) return

    let damage = 0
    let range = 0

    // スキル別のダメージと範囲
    switch (skillType) {
      case 'FIREBALL':
        damage = 100
        range = 80
        this.effectSystem.addExplosion(position, range)
        break
      case 'THUNDERBOLT':
        damage = 200
        range = 120
        this.effectSystem.addExplosion(position, range)
        // サンダーボルトは広範囲攻撃なので、より大きなエフェクトを表示
        this.effectSystem.addSkillAura(position, '#fbbf24', 0.5)
        break
    }

    // 範囲内のモンスターにダメージ
    this.monsters.forEach(monster => {
      if (!monster.isMonsterAlive()) return

      const distance = monster.distanceTo(position)
      if (distance < range) {
        const monsterPos = monster.getPosition()
        monster.takeDamage(damage)
        
        // ダメージエフェクトを表示
        this.effectSystem.addDamageText(monsterPos, damage, true) // クリティカル扱い
        this.effectSystem.addHitFlash(monsterPos, false)

        if (!monster.isMonsterAlive()) {
          const monsterStats = monster.getStats()
          this.player!.addExp(monsterStats.exp)
          this.monstersDefeated++
        }
      }
    })

    console.log(`Magic attack ${skillType}: ${damage} damage in ${range} range`)
  }

  private spawnMonsters(): void {
    if (!this.mapSystem) return

    // MapSystemで定義されたモンスター配置を使用
    const spawns = this.mapSystem.getMonsterSpawns()
    
    spawns.forEach(spawn => {
      // 配置位置が歩行可能かチェック
      if (this.mapSystem!.isWalkable(spawn.x, spawn.y)) {
        const monster = new Monster(spawn.type, spawn.x, spawn.y)
        this.monsters.push(monster)
      }
    })

    console.log(`Spawned ${this.monsters.length} monsters from predefined locations`)
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = (currentTime - this.lastFrameTime) / 1000
    this.lastFrameTime = currentTime

    this.update(deltaTime)
    this.render()

    if (!this.stateManager.isGameOver()) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop)
    }
  }

  private update(deltaTime: number): void {
    if (this.stateManager.isPlaying()) {
      this.timerSystem.update(deltaTime)
      this.effectSystem.update(deltaTime)
      
      if (this.player && this.mapSystem) {
        this.player.update(deltaTime, (x, y) => this.mapSystem!.isWalkable(x, y))
        
        if (this.camera) {
          const playerPos = this.player.getPosition()
          this.camera.follow(playerPos.x, playerPos.y)
        }

        // アイテム自動収集
        this.checkItemCollection()
      }

      if (this.player) {
        const playerPos = this.player.getPosition()
        this.monsters.forEach(monster => {
          monster.update(deltaTime, playerPos)
        })

        this.checkCollisions()
      }
    }
  }

  private checkItemCollection(): void {
    if (!this.player || !this.mapSystem) return

    const playerPos = this.player.getPosition()
    const nearbyItem = this.mapSystem.getNearbyWorldItem(playerPos.x, playerPos.y, 40)

    if (nearbyItem) {
      const itemSystem = this.player.getItemSystem()
      
      if (nearbyItem.isEquipment) {
        // 装備アイテム
        const equipped = itemSystem.equipItem(nearbyItem.type as EquipmentType)
        if (equipped) {
          this.mapSystem.collectWorldItem(nearbyItem.id)
          const equipData = itemSystem.getEquipmentData(nearbyItem.type as EquipmentType)
          console.log(`Collected equipment: ${nearbyItem.type}`)
          
          // アイテムピックアップエフェクト
          if (equipData) {
            this.effectSystem.addItemPickup(playerPos, equipData.name, equipData.color)
          }
          
          // 装備ボーナスをプレイヤーに適用
          this.applyEquipmentBonus()
        }
      } else {
        // 消費アイテム
        const added = itemSystem.addItem(nearbyItem.type as ItemType)
        if (added) {
          this.mapSystem.collectWorldItem(nearbyItem.id)
          this.itemsCollected++
          console.log(`Collected item: ${nearbyItem.type}`)
          
          // アイテムピックアップエフェクト
          const itemData = itemSystem.getItemData(nearbyItem.type as ItemType)
          if (itemData) {
            this.effectSystem.addItemPickup(playerPos, itemData.name, itemData.color)
          }
        }
      }
    }
  }

  private applyEquipmentBonus(): void {
    if (!this.player) return
    
    const itemSystem = this.player.getItemSystem()
    const bonus = itemSystem.getEquipmentBonus()
    
    // プレイヤーのステータスに装備ボーナスを適用
    // これはPlayer.tsのgetAttackPower()とtakeDamage()で処理される
    console.log(`Equipment bonus applied - Attack: +${bonus.attack}, Defense: +${bonus.defense}`)
  }

  private checkCollisions(): void {
    if (!this.player) return

    const playerPos = this.player.getPosition()
    const playerSize = this.player.getSize()

    this.monsters.forEach(monster => {
      if (!monster.isMonsterAlive()) return

      const distance = monster.distanceTo(playerPos)
      const collisionDistance = (playerSize + monster.getSize()) / 2

      if (distance < collisionDistance) {
        const monsterStats = monster.getStats()
        const monsterPos = monster.getPosition()
        
        // プレイヤーがダメージを受ける
        const playerDamage = monsterStats.attack
        this.player!.takeDamage(playerDamage)
        
        // ダメージエフェクトを表示
        this.effectSystem.addDamageText(playerPos, playerDamage)
        this.effectSystem.addHitFlash(playerPos, true)
        
        // モンスターがダメージを受ける
        const attackPower = this.player!.getAttackPower()
        monster.takeDamage(attackPower)
        
        // モンスターのダメージエフェクト
        this.effectSystem.addDamageText(monsterPos, attackPower)
        this.effectSystem.addHitFlash(monsterPos, false)

        if (!monster.isMonsterAlive()) {
          const leveledUp = this.player!.addExp(monsterStats.exp)
          this.monstersDefeated++
          
          // レベルアップエフェクト
          if (leveledUp) {
            console.log('Level up!')
            this.effectSystem.addLevelUpEffect(playerPos)
          }
        }

        if (!this.player!.isAlive()) {
          this.handlePlayerDeath()
        }
      }
    })
  }

  useItem(type: ItemType): void {
    if (!this.player) return

    if (this.player.useItem(type)) {
      const playerPos = this.player.getPosition()
      
      if (type === ItemType.HEALTH_POTION) {
        // 回復エフェクト
        this.effectSystem.addHealText(playerPos, 50)
        this.effectSystem.addSkillAura(playerPos, '#22c55e', 0.5)
      } else if (type === ItemType.BOMB) {
        // 爆発エフェクト
        this.effectSystem.addExplosion(playerPos, 100)
        this.useBomb()
      } else if (type === ItemType.HOLY_WATER) {
        // 聖水エフェクト
        this.effectSystem.addSkillAura(playerPos, '#3b82f6', 1.0)
      }
      
      this.itemsCollected++
    }
  }

  private useBomb(): void {
    if (!this.player) return

    const playerPos = this.player.getPosition()
    const bombRange = 100
    const bombDamage = this.player.getBombDamage()

    this.monsters.forEach(monster => {
      if (!monster.isMonsterAlive()) return

      const distance = monster.distanceTo(playerPos)
      if (distance < bombRange) {
        monster.takeDamage(bombDamage)
        if (!monster.isMonsterAlive()) {
          this.monstersDefeated++
        }
      }
    })

    console.log(`Bomb used! Hit monsters within ${bombRange} range`)
  }

  private handlePlayerDeath(): void {
    console.log('Player died!')
    this.stateManager.changeState(GameState.GAME_OVER)
  }

  private render(): void {
    this.ctx.fillStyle = '#1a1a2e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.stateManager.isPlaying()) {
      this.renderGame()
    } else if (this.stateManager.isGameOver()) {
      // ゲームオーバーは外部のリザルト画面で表示
    }
  }

  private renderGame(): void {
    const cameraPos = this.camera?.getPosition() || { x: 0, y: 0 }

    if (this.mapSystem) {
      this.mapSystem.render(this.ctx, cameraPos.x, cameraPos.y)
    }

    // ワールドアイテムの描画
    if (this.mapSystem && this.player) {
      const worldItems = this.mapSystem.getWorldItems()
      const playerPos = this.player.getPosition()
      
      worldItems.forEach(item => {
        if (item.collected) return
        
        const screenX = item.position.x - cameraPos.x
        const screenY = item.position.y - cameraPos.y
        
        // アイテムの描画
        if (item.isEquipment) {
          // 装備アイテム（金色の宝箱風）
          this.ctx.fillStyle = '#fbbf24'
          this.ctx.fillRect(screenX - 12, screenY - 12, 24, 24)
          this.ctx.strokeStyle = '#f59e0b'
          this.ctx.lineWidth = 2
          this.ctx.strokeRect(screenX - 12, screenY - 12, 24, 24)
          
          // アイテム名
          this.ctx.fillStyle = '#ffffff'
          this.ctx.font = '10px monospace'
          this.ctx.textAlign = 'center'
          const itemSystem = this.player.getItemSystem()
          const equipData = itemSystem.getEquipmentData(item.type as EquipmentType)
          if (equipData) {
            this.ctx.fillText(equipData.name, screenX, screenY - 18)
          }
        } else {
          // 消費アイテム（色付きの箱）
          const itemSystem = this.player.getItemSystem()
          const itemData = itemSystem.getItemData(item.type as ItemType)
          
          if (itemData) {
            this.ctx.fillStyle = itemData.color
            this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20)
            this.ctx.strokeStyle = '#000000'
            this.ctx.lineWidth = 2
            this.ctx.strokeRect(screenX - 10, screenY - 10, 20, 20)
            
            this.ctx.fillStyle = '#ffffff'
            this.ctx.font = '10px monospace'
            this.ctx.textAlign = 'center'
            this.ctx.fillText(itemData.name, screenX, screenY - 16)
          }
        }
        
        // インタラクト可能範囲の表示
        const dx = item.position.x - playerPos.x
        const dy = item.position.y - playerPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance <= 40) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
          this.ctx.font = '10px monospace'
          this.ctx.textAlign = 'center'
          this.ctx.fillText('↓ 近づいて収集', screenX, screenY + 25)
        }
      })
    }

    // NPCの描画
    if (this.mapSystem && this.player) {
      const npcs = this.mapSystem.getNPCs()
      const playerPos = this.player.getPosition()
      
      npcs.forEach(npc => {
        const screenX = npc.x - cameraPos.x
        const screenY = npc.y - cameraPos.y
        
        // NPC描画（簡易版）
        this.ctx.fillStyle = '#ffcc00'
        this.ctx.fillRect(screenX - 16, screenY - 16, 32, 32)
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = '12px monospace'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(npc.name, screenX, screenY - 20)
        
        // インタラクト可能範囲の表示
        const distance = npc.getDistanceToPlayer(playerPos.x, playerPos.y)
        if (distance <= 50) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          this.ctx.font = '10px monospace'
          this.ctx.fillText('[E] 話す', screenX, screenY + 30)
        }
      })
      
      // 石碑の描画
      const monuments = this.mapSystem.getMonuments()
      monuments.forEach(monument => {
        const screenX = monument.x - cameraPos.x
        const screenY = monument.y - cameraPos.y
        
        // 石碑描画（簡易版）
        this.ctx.fillStyle = monument.investigated ? '#888888' : '#999999'
        this.ctx.fillRect(screenX - 16, screenY - 32, 32, 64)
        this.ctx.strokeStyle = '#666666'
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(screenX - 16, screenY - 32, 32, 64)
        
        // インタラクト可能範囲の表示
        const distance = monument.getDistanceToPlayer(playerPos.x, playerPos.y)
        if (distance <= 50) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          this.ctx.font = '10px monospace'
          this.ctx.textAlign = 'center'
          this.ctx.fillText('[E] 調査', screenX, screenY + 40)
        }
      })
    }

    this.monsters.forEach(monster => {
      if (monster.isMonsterAlive()) {
        monster.render(this.ctx, cameraPos.x, cameraPos.y)
      }
    })

    if (this.player) {
      this.player.render(this.ctx, cameraPos.x, cameraPos.y)
    }

    // エフェクトの描画（プレイヤーとモンスターの上に描画）
    this.effectSystem.render(this.ctx, cameraPos.x, cameraPos.y)

    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '14px monospace'
    this.ctx.textAlign = 'left'
    const aliveMonsters = this.monsters.filter(m => m.isMonsterAlive()).length
    this.ctx.fillText(`モンスター: ${aliveMonsters}`, 10, this.canvas.height - 10)
  }

  private handleTimeUp(): void {
    console.log('Time up!')
    this.stateManager.changeState(GameState.GAME_OVER)
  }

  pauseGame(): void {
    if (this.stateManager.isPlaying()) {
      this.stateManager.changeState(GameState.PAUSED)
      this.timerSystem.pause()
    }
  }

  resumeGame(): void {
    if (this.stateManager.isPaused()) {
      this.stateManager.changeState(GameState.PLAYING)
      this.timerSystem.resume()
    }
  }

  stopGame(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.stateManager.changeState(GameState.TITLE_SCREEN)
  }

  getGameResult(): GameResult | null {
    if (!this.player || !this.timeMode) return null

    const playerStats = this.player.getStats()
    const remainingTime = this.timerSystem.getRemainingTime()
    const cleared = this.player.isAlive() && this.timerSystem.isTimeUp()

    return this.scoreSystem.calculateScore(
      this.timeMode,
      remainingTime,
      playerStats.level,
      this.monstersDefeated,
      this.itemsCollected,
      cleared
    )
  }

  // NPC会話関連メソッド
  interactWithNearbyNPC(): boolean {
    if (!this.player || !this.mapSystem || this.isDialogOpen) {
      return false
    }

    const playerPos = this.player.getPosition()
    const nearbyNPC = this.mapSystem.getNearbyNPC(playerPos.x, playerPos.y, 50)

    if (nearbyNPC) {
      this.activeNPC = nearbyNPC
      this.isDialogOpen = true
      return true
    }

    return false
  }

  interactWithNearbyMonument(): boolean {
    if (!this.player || !this.mapSystem || this.isDialogOpen) {
      return false
    }

    const playerPos = this.player.getPosition()
    const nearbyMonument = this.mapSystem.getNearbyMonument(playerPos.x, playerPos.y, 50)

    if (nearbyMonument) {
      this.activeMonument = nearbyMonument
      this.isDialogOpen = true
      return true
    }

    return false
  }

  getActiveNPC(): NPC | null {
    return this.activeNPC
  }

  getActiveMonument(): Monument | null {
    return this.activeMonument
  }

  closeDialog(): void {
    this.activeNPC = null
    this.activeMonument = null
    this.isDialogOpen = false
  }

  isInDialog(): boolean {
    return this.isDialogOpen
  }

  getTimerSystem(): TimerSystem {
    return this.timerSystem
  }

  getStateManager(): GameStateManager {
    return this.stateManager
  }

  getPlayer(): Player | null {
    return this.player
  }

  getMonstersDefeated(): number {
    return this.monstersDefeated
  }
}
