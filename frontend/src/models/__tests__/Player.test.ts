import { describe, it, expect, vi } from 'vitest'
import { Player } from '../Player'
import { SkillType } from '../Skill'

describe('Player Archer class', () => {
  it('initializes with high attack, low defense, and low speed', () => {
    const player = new Player('ARCHER')
    player.setPosition(0, 0)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
    player.update(1)

    expect(player.getStats()).toMatchObject({
      hp: 60,
      maxHp: 60,
      attack: 18,
      defense: 1,
    })
    expect(player.getPosition().x).toBe(100)

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }))
    player.destroy()
  })

  it('fires ranged special attacks through the callback', () => {
    const player = new Player('ARCHER')
    const onSpecialAttack = vi.fn()

    player.onSpecialAttack = onSpecialAttack

    expect(player.useSkill(SkillType.PIERCING_ARROW)).toBe(true)
    expect(onSpecialAttack).toHaveBeenCalledWith(SkillType.PIERCING_ARROW, { x: 0, y: 0 })

    player.destroy()
  })
})
