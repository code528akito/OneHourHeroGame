import { Vector2 } from '@/types'
import { MonsterType } from '@/models/Monster'
import { NPC, NPCData, Monument, MonumentData } from '@/models/NPC'
import { WorldItem, ItemType, EquipmentType } from '@/models/Item'

export enum TileType {
  GRASS = 0,
  DIRT = 1,
  STONE = 2,
  WATER = 3,
  TREE = 4,
  WALL = 5,
  FOREST = 6,
  CRYSTAL = 7,  // クリスタルの洞窟用
  CAVE_FLOOR = 8, // 洞窟床
  LAVA = 9,  // 溶岩
  CASTLE_FLOOR = 10, // 城床
}

export interface Tile {
  type: TileType
  walkable: boolean
  color: string
}

export interface Area {
  id: string
  name: string
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  monsterSpawns: MonsterSpawn[]
}

export interface MonsterSpawn {
  type: MonsterType
  x: number
  y: number
}

export class MapSystem {
  private width: number
  private height: number
  private tileSize: number
  private tiles: TileType[][]
  private tileData: Map<TileType, Tile>
  private areas: Area[]
  private npcs: NPC[]
  private monuments: Monument[]
  private worldItems: WorldItem[]

  constructor(width: number, height: number, tileSize: number = 32) {
    this.width = width
    this.height = height
    this.tileSize = tileSize
    this.tiles = []
    this.tileData = new Map()
    this.areas = []
    this.npcs = []
    this.monuments = []
    this.worldItems = []

    this.initializeTileData()
    this.generateMap()
    this.defineAreas()
    this.initializeNPCs()
    this.initializeMonuments()
    this.initializeWorldItems()
  }

  private initializeTileData(): void {
    this.tileData.set(TileType.GRASS, {
      type: TileType.GRASS,
      walkable: true,
      color: '#4a7c59',
    })
    this.tileData.set(TileType.DIRT, {
      type: TileType.DIRT,
      walkable: true,
      color: '#8b7355',
    })
    this.tileData.set(TileType.STONE, {
      type: TileType.STONE,
      walkable: true,
      color: '#6b7280',
    })
    this.tileData.set(TileType.WATER, {
      type: TileType.WATER,
      walkable: false,
      color: '#3b82f6',
    })
    this.tileData.set(TileType.TREE, {
      type: TileType.TREE,
      walkable: false,
      color: '#2d5016',
    })
    this.tileData.set(TileType.WALL, {
      type: TileType.WALL,
      walkable: false,
      color: '#4b5563',
    })
    this.tileData.set(TileType.FOREST, {
      type: TileType.FOREST,
      walkable: true,
      color: '#3a5a2a',
    })
    this.tileData.set(TileType.CRYSTAL, {
      type: TileType.CRYSTAL,
      walkable: false,
      color: '#06b6d4',
    })
    this.tileData.set(TileType.CAVE_FLOOR, {
      type: TileType.CAVE_FLOOR,
      walkable: true,
      color: '#374151',
    })
    this.tileData.set(TileType.LAVA, {
      type: TileType.LAVA,
      walkable: false,
      color: '#ea580c',
    })
    this.tileData.set(TileType.CASTLE_FLOOR, {
      type: TileType.CASTLE_FLOOR,
      walkable: true,
      color: '#1f2937',
    })
  }

  private generateMap(): void {
    // マップ全体を草地で初期化
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = []
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = TileType.GRASS
      }
    }

    // 外周の壁
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          this.tiles[y][x] = TileType.WALL
        }
      }
    }

    // スタートの町（中央）
    const centerX = Math.floor(this.width / 2)
    const centerY = Math.floor(this.height / 2)
    this.createTownArea(centerX, centerY)

    // 始まりの平原（町の周り）
    this.createPlainsArea(centerX - 8, centerY - 8, 16, 16)

    // ささやきの森（上部）
    this.createForestArea(centerX - 10, 5, 20, 15)

    // クリスタルの洞窟（右部）
    this.createCaveArea(centerX + 15, centerY - 8, 15, 16)

    // 灼熱火山・魔王城（下部）
    this.createVolcanoCastleArea(centerX - 8, centerY + 15, 16, 20)

    // 道の作成
    this.createPath(centerX, centerY, centerX, 10)
    this.createPath(centerX, centerY, centerX + 15, centerY)
    this.createPath(centerX, centerY, centerX, centerY + 15)
  }

  private createTownArea(centerX: number, centerY: number): void {
    // 町の領域を土で作成
    for (let y = centerY - 2; y <= centerY + 2; y++) {
      for (let x = centerX - 2; x <= centerX + 2; x++) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          this.tiles[y][x] = TileType.DIRT
        }
      }
    }
  }

  private createPlainsArea(startX: number, startY: number, width: number, height: number): void {
    // 平原に時々木を配置
    for (let y = startY; y < startY + height && y < this.height; y++) {
      for (let x = startX; x < startX + width && x < this.width; x++) {
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          if (Math.random() < 0.03) {
            this.tiles[y][x] = TileType.TREE
          }
        }
      }
    }
  }

  private createForestArea(startX: number, startY: number, width: number, height: number): void {
    // 森エリアを森タイルで作成
    for (let y = startY; y < startY + height && y < this.height; y++) {
      for (let x = startX; x < startX + width && x < this.width; x++) {
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          if (Math.random() < 0.3) {
            this.tiles[y][x] = TileType.TREE
          } else {
            this.tiles[y][x] = TileType.FOREST
          }
        }
      }
    }
  }

  private createPath(x1: number, y1: number, x2: number, y2: number): void {
    // 垂直または水平の道を作成
    if (x1 === x2) {
      // 垂直の道
      const startY = Math.min(y1, y2)
      const endY = Math.max(y1, y2)
      for (let y = startY; y <= endY; y++) {
        if (y > 0 && y < this.height - 1) {
          this.tiles[y][x1] = TileType.DIRT
          if (x1 - 1 > 0) this.tiles[y][x1 - 1] = TileType.DIRT
          if (x1 + 1 < this.width - 1) this.tiles[y][x1 + 1] = TileType.DIRT
        }
      }
    } else if (y1 === y2) {
      // 水平の道
      const startX = Math.min(x1, x2)
      const endX = Math.max(x1, x2)
      for (let x = startX; x <= endX; x++) {
        if (x > 0 && x < this.width - 1) {
          this.tiles[y1][x] = TileType.DIRT
          if (y1 - 1 > 0) this.tiles[y1 - 1][x] = TileType.DIRT
          if (y1 + 1 < this.height - 1) this.tiles[y1 + 1][x] = TileType.DIRT
        }
      }
    }
  }

  private createCaveArea(startX: number, startY: number, width: number, height: number): void {
    // 洞窟エリアを作成
    for (let y = startY; y < startY + height && y < this.height; y++) {
      for (let x = startX; x < startX + width && x < this.width; x++) {
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          // 周囲を壁に
          if (x === startX || x === startX + width - 1 || y === startY || y === startY + height - 1) {
            this.tiles[y][x] = TileType.WALL
          } else {
            // 内部を洞窟床に
            this.tiles[y][x] = TileType.CAVE_FLOOR
            // ランダムにクリスタルを配置
            if (Math.random() < 0.15) {
              this.tiles[y][x] = TileType.CRYSTAL
            }
          }
        }
      }
    }
    
    // 入口を作成
    if (startX > 0) {
      const entranceY = startY + Math.floor(height / 2)
      this.tiles[entranceY][startX] = TileType.CAVE_FLOOR
      this.tiles[entranceY - 1][startX] = TileType.CAVE_FLOOR
      this.tiles[entranceY + 1][startX] = TileType.CAVE_FLOOR
    }
  }

  private createVolcanoCastleArea(startX: number, startY: number, width: number, height: number): void {
    // 灼熱火山・魔王城エリアを作成
    for (let y = startY; y < startY + height && y < this.height; y++) {
      for (let x = startX; x < startX + width && x < this.width; x++) {
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          // 周囲を壁に
          if (x === startX || x === startX + width - 1 || y === startY || y === startY + height - 1) {
            this.tiles[y][x] = TileType.WALL
          } else {
            // 前半は火山（溶岩）
            if (y < startY + height / 2) {
              this.tiles[y][x] = TileType.STONE
              // ランダムに溶岩を配置
              if (Math.random() < 0.2) {
                this.tiles[y][x] = TileType.LAVA
              }
            } else {
              // 後半は魔王城
              this.tiles[y][x] = TileType.CASTLE_FLOOR
              // ランダムに壁を配置
              if (Math.random() < 0.1) {
                this.tiles[y][x] = TileType.WALL
              }
            }
          }
        }
      }
    }
    
    // 入口を作成
    if (startY > 0) {
      const entranceX = startX + Math.floor(width / 2)
      this.tiles[startY][entranceX] = TileType.STONE
      this.tiles[startY][entranceX - 1] = TileType.STONE
      this.tiles[startY][entranceX + 1] = TileType.STONE
    }
  }

  private defineAreas(): void {
    const centerX = Math.floor(this.width / 2)
    const centerY = Math.floor(this.height / 2)

    // スタートの町
    this.areas.push({
      id: 'town',
      name: 'スタートの町',
      bounds: {
        x: (centerX - 3) * this.tileSize,
        y: (centerY - 3) * this.tileSize,
        width: 6 * this.tileSize,
        height: 6 * this.tileSize,
      },
      monsterSpawns: [],
    })

    // 始まりの平原
    this.areas.push({
      id: 'plains',
      name: '始まりの平原',
      bounds: {
        x: (centerX - 10) * this.tileSize,
        y: (centerY - 10) * this.tileSize,
        width: 20 * this.tileSize,
        height: 20 * this.tileSize,
      },
      monsterSpawns: this.generatePlainsSpawns(centerX, centerY),
    })

    // ささやきの森
    this.areas.push({
      id: 'forest',
      name: 'ささやきの森',
      bounds: {
        x: (centerX - 10) * this.tileSize,
        y: 5 * this.tileSize,
        width: 20 * this.tileSize,
        height: 15 * this.tileSize,
      },
      monsterSpawns: this.generateForestSpawns(centerX),
    })

    // クリスタルの洞窟
    this.areas.push({
      id: 'crystal_cave',
      name: 'クリスタルの洞窟',
      bounds: {
        x: (centerX + 15) * this.tileSize,
        y: (centerY - 8) * this.tileSize,
        width: 15 * this.tileSize,
        height: 16 * this.tileSize,
      },
      monsterSpawns: this.generateCaveSpawns(centerX + 22, centerY),
    })

    // 灼熱火山・魔王城
    this.areas.push({
      id: 'volcano_castle',
      name: '灼熱火山・魔王城',
      bounds: {
        x: (centerX - 8) * this.tileSize,
        y: (centerY + 15) * this.tileSize,
        width: 16 * this.tileSize,
        height: 20 * this.tileSize,
      },
      monsterSpawns: this.generateVolcanoCastleSpawns(centerX, centerY + 22),
    })
  }

  private generatePlainsSpawns(centerX: number, centerY: number): MonsterSpawn[] {
    const spawns: MonsterSpawn[] = []
    
    // スライムを町の周りに配置（経験値稼ぎ用）
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const distance = 5 + Math.random() * 3
      spawns.push({
        type: MonsterType.SLIME,
        x: (centerX + Math.cos(angle) * distance) * this.tileSize,
        y: (centerY + Math.sin(angle) * distance) * this.tileSize,
      })
    }

    // ゴブリンを平原に配置（集団で）
    const goblinGroups = 3
    for (let g = 0; g < goblinGroups; g++) {
      const groupX = centerX + (Math.random() - 0.5) * 12
      const groupY = centerY + (Math.random() - 0.5) * 12
      const groupSize = 2 + Math.floor(Math.random() * 3)
      
      for (let i = 0; i < groupSize; i++) {
        spawns.push({
          type: MonsterType.GOBLIN,
          x: (groupX + (Math.random() - 0.5) * 2) * this.tileSize,
          y: (groupY + (Math.random() - 0.5) * 2) * this.tileSize,
        })
      }
    }

    return spawns
  }

  private generateForestSpawns(centerX: number): MonsterSpawn[] {
    const spawns: MonsterSpawn[] = []
    
    // 森のオオカミを配置
    for (let i = 0; i < 6; i++) {
      spawns.push({
        type: MonsterType.WOLF,
        x: (centerX - 8 + Math.random() * 16) * this.tileSize,
        y: (7 + Math.random() * 10) * this.tileSize,
      })
    }

    // ゴブリンも少し配置
    for (let i = 0; i < 4; i++) {
      spawns.push({
        type: MonsterType.GOBLIN,
        x: (centerX - 7 + Math.random() * 14) * this.tileSize,
        y: (8 + Math.random() * 8) * this.tileSize,
      })
    }

    // 古のトレント（ミニボス）を森の奥に配置
    spawns.push({
      type: MonsterType.TRENT,
      x: centerX * this.tileSize,
      y: 10 * this.tileSize,
    })

    return spawns
  }

  private generateCaveSpawns(centerX: number, centerY: number): MonsterSpawn[] {
    const spawns: MonsterSpawn[] = []
    
    // ロックゴーレムを配置（高防御力）
    for (let i = 0; i < 5; i++) {
      spawns.push({
        type: MonsterType.ROCK_GOLEM,
        x: (centerX + (Math.random() - 0.5) * 10) * this.tileSize,
        y: (centerY + (Math.random() - 0.5) * 10) * this.tileSize,
      })
    }

    // ジャイアントバットを配置（素早い）
    for (let i = 0; i < 7; i++) {
      spawns.push({
        type: MonsterType.GIANT_BAT,
        x: (centerX + (Math.random() - 0.5) * 12) * this.tileSize,
        y: (centerY + (Math.random() - 0.5) * 12) * this.tileSize,
      })
    }

    // クリスタル・リザード（ミニボス）を洞窟の奥に配置
    spawns.push({
      type: MonsterType.CRYSTAL_LIZARD,
      x: (centerX + 5) * this.tileSize,
      y: (centerY + 5) * this.tileSize,
    })

    return spawns
  }

  private generateVolcanoCastleSpawns(centerX: number, centerY: number): MonsterSpawn[] {
    const spawns: MonsterSpawn[] = []
    
    // ヘルハウンドを火山エリアに配置
    for (let i = 0; i < 6; i++) {
      spawns.push({
        type: MonsterType.HELLHOUND,
        x: (centerX + (Math.random() - 0.5) * 12) * this.tileSize,
        y: (centerY - 5 + Math.random() * 8) * this.tileSize,
      })
    }

    // 魔王軍・近衛騎士を城エリアに配置
    for (let i = 0; i < 5; i++) {
      spawns.push({
        type: MonsterType.ROYAL_GUARD,
        x: (centerX + (Math.random() - 0.5) * 10) * this.tileSize,
        y: (centerY + 5 + Math.random() * 8) * this.tileSize,
      })
    }

    // 魔王（最終ボス）を城の最奥に配置
    spawns.push({
      type: MonsterType.DEMON_LORD,
      x: centerX * this.tileSize,
      y: (centerY + 12) * this.tileSize,
    })

    return spawns
  }

  getAreas(): Area[] {
    return this.areas
  }

  getMonsterSpawns(): MonsterSpawn[] {
    const allSpawns: MonsterSpawn[] = []
    for (const area of this.areas) {
      allSpawns.push(...area.monsterSpawns)
    }
    return allSpawns
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
    const startX = Math.floor(Math.max(0, cameraX / this.tileSize))
    const startY = Math.floor(Math.max(0, cameraY / this.tileSize))
    const endX = Math.min(this.width, startX + Math.ceil(ctx.canvas.width / this.tileSize) + 1)
    const endY = Math.min(this.height, startY + Math.ceil(ctx.canvas.height / this.tileSize) + 1)

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tileType = this.tiles[y][x]
        const tile = this.tileData.get(tileType)
        if (tile) {
          const screenX = x * this.tileSize - cameraX
          const screenY = y * this.tileSize - cameraY

          ctx.fillStyle = tile.color
          ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize)

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
          ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize)
        }
      }
    }
  }

  isWalkable(x: number, y: number): boolean {
    const tileX = Math.floor(x / this.tileSize)
    const tileY = Math.floor(y / this.tileSize)

    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return false
    }

    const tileType = this.tiles[tileY][tileX]
    const tile = this.tileData.get(tileType)
    return tile ? tile.walkable : false
  }

  getTileAt(x: number, y: number): Tile | null {
    const tileX = Math.floor(x / this.tileSize)
    const tileY = Math.floor(y / this.tileSize)

    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return null
    }

    const tileType = this.tiles[tileY][tileX]
    return this.tileData.get(tileType) || null
  }

  getWorldSize(): Vector2 {
    return {
      x: this.width * this.tileSize,
      y: this.height * this.tileSize,
    }
  }

  getTileSize(): number {
    return this.tileSize
  }

  getMapDimensions(): Vector2 {
    return {
      x: this.width,
      y: this.height,
    }
  }

  // NPC関連メソッド
  private initializeNPCs(): void {
    // スタートの町のNPC
    const townGuard: NPCData = {
      id: 'town_guard_1',
      name: '町の門番',
      type: 'guard',
      x: 350,
      y: 150,
      dialogs: [
        {
          id: 'greeting',
          text: 'ようこそ、勇者よ！\n魔王が復活したという噂が広まっている。\n気をつけて進むのだ。',
          skipable: true,
        },
        {
          id: 'tips',
          text: '森には弱いモンスターが多いが、\n古のトレントには注意が必要だ。\n炎属性が効果的だと聞いたことがある。',
          skipable: true,
        },
      ],
      initialDialogId: 'greeting',
      info: {
        monsterWeakness: {
          '古のトレント': '炎属性攻撃が効果的',
        },
      },
    }

    const sage: NPCData = {
      id: 'sage_1',
      name: '賢者',
      type: 'sage',
      x: 400,
      y: 200,
      dialogs: [
        {
          id: 'greeting',
          text: '私は長年この地を見守ってきた賢者じゃ。\n何か知りたいことはあるかの？',
          options: [
            {
              text: 'モンスターについて教えてください',
              nextDialogId: 'monsters',
            },
            {
              text: '魔王について教えてください',
              nextDialogId: 'demon_king',
            },
            {
              text: 'いいえ、大丈夫です',
            },
          ],
        },
        {
          id: 'monsters',
          text: 'スライムは最も弱いモンスターじゃ。\nゴブリンは群れで行動する。\n森のオオカミは素早いので注意が必要じゃぞ。',
          skipable: true,
        },
        {
          id: 'demon_king',
          text: '魔王は恐ろしい力を持っておる。\n3つの形態に変化すると言われておる。\n十分に力をつけてから挑むのじゃ！',
          skipable: true,
        },
      ],
      initialDialogId: 'greeting',
      info: {
        tips: [
          '経験値を稼いでレベルを上げよう',
          '装備を見つけて強化しよう',
          'スキルを効果的に使おう',
        ],
      },
    }

    this.npcs.push(new NPC(townGuard))
    this.npcs.push(new NPC(sage))
  }

  private initializeMonuments(): void {
    // 森の石碑
    const forestMonument: MonumentData = {
      id: 'forest_monument_1',
      x: 300,
      y: 600,
      title: '古の石碑',
      text: '「ここに眠るは古代の守護者\n森を守りし者よ\n炎の試練を乗り越えし者のみ\n先に進むことを許されん」',
    }

    // 洞窟の石碑
    const caveMonument: MonumentData = {
      id: 'cave_monument_1',
      x: 800,
      y: 400,
      title: 'クリスタルの記録',
      text: '「氷と岩の守護者ここに在り\n物理攻撃は通じず\n魔法の力こそが道を開く」',
    }

    this.monuments.push(new Monument(forestMonument))
    this.monuments.push(new Monument(caveMonument))
  }

  private initializeWorldItems(): void {
    const centerX = Math.floor(this.width / 2)
    const centerY = Math.floor(this.height / 2)

    // 炎の剣（ささやきの森）
    this.worldItems.push({
      id: 'flame_sword_1',
      type: EquipmentType.FLAME_SWORD,
      position: {
        x: centerX * this.tileSize,
        y: 8 * this.tileSize,
      },
      isEquipment: true,
      collected: false,
    })

    // 氷の盾（クリスタルの洞窟）
    this.worldItems.push({
      id: 'ice_shield_1',
      type: EquipmentType.ICE_SHIELD,
      position: {
        x: (centerX + 20) * this.tileSize,
        y: centerY * this.tileSize,
      },
      isEquipment: true,
      collected: false,
    })

    // 回復ポーション（平原に複数配置）
    for (let i = 0; i < 3; i++) {
      this.worldItems.push({
        id: `health_potion_${i + 1}`,
        type: ItemType.HEALTH_POTION,
        position: {
          x: (centerX + (Math.random() - 0.5) * 8) * this.tileSize,
          y: (centerY + (Math.random() - 0.5) * 8) * this.tileSize,
        },
        isEquipment: false,
        collected: false,
      })
    }

    // ボム（洞窟に配置）
    for (let i = 0; i < 2; i++) {
      this.worldItems.push({
        id: `bomb_${i + 1}`,
        type: ItemType.BOMB,
        position: {
          x: (centerX + 18 + Math.random() * 6) * this.tileSize,
          y: (centerY + (Math.random() - 0.5) * 6) * this.tileSize,
        },
        isEquipment: false,
        collected: false,
      })
    }

    // 聖水（魔王城に配置）
    this.worldItems.push({
      id: 'holy_water_1',
      type: ItemType.HOLY_WATER,
      position: {
        x: centerX * this.tileSize,
        y: (centerY + 25) * this.tileSize,
      },
      isEquipment: false,
      collected: false,
    })
  }

  getNPCs(): NPC[] {
    return this.npcs
  }

  getMonuments(): Monument[] {
    return this.monuments
  }

  getNearbyNPC(x: number, y: number, range: number = 50): NPC | null {
    for (const npc of this.npcs) {
      if (npc.getDistanceToPlayer(x, y) <= range) {
        return npc
      }
    }
    return null
  }

  getNearbyMonument(x: number, y: number, range: number = 50): Monument | null {
    for (const monument of this.monuments) {
      if (monument.getDistanceToPlayer(x, y) <= range) {
        return monument
      }
    }
    return null
  }

  getWorldItems(): WorldItem[] {
    return this.worldItems
  }

  getNearbyWorldItem(x: number, y: number, range: number = 50): WorldItem | null {
    for (const item of this.worldItems) {
      if (item.collected) continue
      
      const dx = item.position.x - x
      const dy = item.position.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= range) {
        return item
      }
    }
    return null
  }

  collectWorldItem(itemId: string): boolean {
    const item = this.worldItems.find(i => i.id === itemId)
    if (item && !item.collected) {
      item.collected = true
      return true
    }
    return false
  }
}

export class Camera {
  private x: number = 0
  private y: number = 0
  private canvasWidth: number
  private canvasHeight: number
  private worldWidth: number
  private worldHeight: number

  constructor(canvasWidth: number, canvasHeight: number, worldWidth: number, worldHeight: number) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
  }

  follow(targetX: number, targetY: number): void {
    this.x = targetX - this.canvasWidth / 2
    this.y = targetY - this.canvasHeight / 2

    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.canvasWidth))
    this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.canvasHeight))
  }

  getPosition(): Vector2 {
    return { x: this.x, y: this.y }
  }

  worldToScreen(worldX: number, worldY: number): Vector2 {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    }
  }

  screenToWorld(screenX: number, screenY: number): Vector2 {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    }
  }
}
