import { describe, it, expect } from 'vitest'
import { SkillSystem, SkillType } from '../Skill'

describe('SkillSystem Archer skills', () => {
  it('registers Archer-only skills for the Archer class', () => {
    const skillSystem = new SkillSystem('ARCHER')
    const classSkills = skillSystem.getClassSkills()

    expect(classSkills).toEqual([SkillType.PIERCING_ARROW, SkillType.ARROW_RAIN])
    expect(skillSystem.getSkillData(SkillType.PIERCING_ARROW)?.name).toBe('ピアシングアロー')
    expect(skillSystem.getSkillData(SkillType.ARROW_RAIN)?.description).toContain('敵3体')
  })
})
