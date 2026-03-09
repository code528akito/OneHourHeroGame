import { beforeAll, describe, it, expect, vi } from 'vitest'
import { Monster, MonsterType } from '@/models/Monster'
import { Player } from '@/models/Player'
import { selectNearestLivingMonsters } from '../GameEngine'
import { GameEngine } from '../GameEngine'

beforeAll(() => {
  const mockContext = {
    imageSmoothingEnabled: false,
  } as CanvasRenderingContext2D

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(contextId => {
    if (contextId === '2d') {
      return mockContext
    }

    return null
  })
})

describe('selectNearestLivingMonsters', () => {
  it('returns the closest living monsters inside range for Archer attacks', () => {
    const nearMonster = new Monster(MonsterType.SLIME, 120, 0)
    const midMonster = new Monster(MonsterType.GOBLIN, 220, 0)
    const farMonster = new Monster(MonsterType.WOLF, 360, 0)

    const targets = selectNearestLivingMonsters(
      [farMonster, midMonster, nearMonster],
      { x: 0, y: 0 },
      320,
      2
    )

    expect(targets).toHaveLength(2)
    expect(targets[0]).toBe(nearMonster)
    expect(targets[1]).toBe(midMonster)
  })

  it('lets Archer auto-attack at range without requiring collision', () => {
    const engine = new GameEngine(document.createElement('canvas')) as never as {
      player: Player
      monsters: Monster[]
      monstersDefeated: number
      updateArcherAutoAttack: (deltaTime: number) => void
    }
    const player = new Player('ARCHER')
    const target = new Monster(MonsterType.SLIME, 150, 0)

    player.setPosition(0, 0)
    engine.player = player
    engine.monsters = [target]
    engine.monstersDefeated = 0

    engine.updateArcherAutoAttack(1)

    expect(target.isMonsterAlive()).toBe(false)
    expect(engine.monstersDefeated).toBe(1)

    player.destroy()
  })

  it('prevents Archer from dealing melee counter damage on collision', () => {
    const engine = new GameEngine(document.createElement('canvas')) as never as {
      player: Player
      monsters: Monster[]
      checkCollisions: () => void
    }
    const player = new Player('ARCHER')
    const target = new Monster(MonsterType.GOBLIN, 0, 0)
    const startingHp = target.getStats().hp

    player.setPosition(0, 0)
    engine.player = player
    engine.monsters = [target]

    engine.checkCollisions()

    expect(target.getStats().hp).toBe(startingHp)
    expect(player.getStats().hp).toBeLessThan(player.getStats().maxHp)

    player.destroy()
  })
})
