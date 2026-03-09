import { describe, it, expect } from 'vitest'
import { Monster, MonsterType } from '@/models/Monster'
import { selectNearestLivingMonsters } from '../GameEngine'

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
})
