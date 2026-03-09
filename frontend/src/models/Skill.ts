export enum SkillType {
  POWER_SMASH = 'POWER_SMASH',
  IRON_WALL = 'IRON_WALL',
  FIREBALL = 'FIREBALL',
  THUNDERBOLT = 'THUNDERBOLT',
  FIRST_STRIKE = 'FIRST_STRIKE',
  WIND_WALK = 'WIND_WALK',
  PIERCING_ARROW = 'PIERCING_ARROW',
  ARROW_RAIN = 'ARROW_RAIN',
}

export interface SkillData {
  type: SkillType
  name: string
  description: string
  cooldown: number
  duration: number
  classType: string
  color: string
}

export interface SkillInstance {
  type: SkillType
  cooldownRemaining: number
  durationRemaining: number
  isActive: boolean
}

export class SkillSystem {
  private skills: Map<SkillType, SkillInstance> = new Map()
  private skillData: Map<SkillType, SkillData> = new Map()
  private classType: string

  constructor(classType: string) {
    this.classType = classType
    this.initializeSkillData()
    this.initializeSkills()
  }

  private initializeSkillData(): void {
    // 騎士のスキル
    this.skillData.set(SkillType.POWER_SMASH, {
      type: SkillType.POWER_SMASH,
      name: 'パワースマッシュ',
      description: '次の攻撃威力2倍',
      cooldown: 10,
      duration: 5,
      classType: 'KNIGHT',
      color: '#ef4444',
    })

    this.skillData.set(SkillType.IRON_WALL, {
      type: SkillType.IRON_WALL,
      name: 'アイアンウォール',
      description: 'ダメージ50%軽減',
      cooldown: 15,
      duration: 8,
      classType: 'KNIGHT',
      color: '#6b7280',
    })

    // 魔法使いのスキル
    this.skillData.set(SkillType.FIREBALL, {
      type: SkillType.FIREBALL,
      name: 'ファイアボール',
      description: '魔法攻撃100ダメージ',
      cooldown: 8,
      duration: 0,
      classType: 'MAGE',
      color: '#f97316',
    })

    this.skillData.set(SkillType.THUNDERBOLT, {
      type: SkillType.THUNDERBOLT,
      name: 'サンダーボルト',
      description: '強力な魔法攻撃200ダメージ',
      cooldown: 20,
      duration: 0,
      classType: 'MAGE',
      color: '#eab308',
    })

    // 盗賊のスキル
    this.skillData.set(SkillType.FIRST_STRIKE, {
      type: SkillType.FIRST_STRIKE,
      name: 'ファーストストライク',
      description: '次の攻撃が必ずクリティカル',
      cooldown: 12,
      duration: 3,
      classType: 'THIEF',
      color: '#8b5cf6',
    })

    this.skillData.set(SkillType.WIND_WALK, {
      type: SkillType.WIND_WALK,
      name: 'ウィンドウォーク',
      description: '移動速度2倍',
      cooldown: 15,
      duration: 10,
      classType: 'THIEF',
      color: '#06b6d4',
    })

    // 弓使いのスキル
    this.skillData.set(SkillType.PIERCING_ARROW, {
      type: SkillType.PIERCING_ARROW,
      name: 'ピアシングアロー',
      description: '最も近い敵に遠距離160ダメージ',
      cooldown: 6,
      duration: 0,
      classType: 'ARCHER',
      color: '#f59e0b',
    })

    this.skillData.set(SkillType.ARROW_RAIN, {
      type: SkillType.ARROW_RAIN,
      name: 'アローレイン',
      description: '遠距離の敵3体に120ダメージ',
      cooldown: 14,
      duration: 0,
      classType: 'ARCHER',
      color: '#84cc16',
    })
  }

  private initializeSkills(): void {
    this.skillData.forEach((data, type) => {
      if (data.classType === this.classType) {
        this.skills.set(type, {
          type,
          cooldownRemaining: 0,
          durationRemaining: 0,
          isActive: false,
        })
      }
    })
  }

  update(deltaTime: number): void {
    this.skills.forEach(skill => {
      if (skill.cooldownRemaining > 0) {
        skill.cooldownRemaining -= deltaTime
        if (skill.cooldownRemaining < 0) {
          skill.cooldownRemaining = 0
        }
      }

      if (skill.isActive && skill.durationRemaining > 0) {
        skill.durationRemaining -= deltaTime
        if (skill.durationRemaining <= 0) {
          skill.durationRemaining = 0
          skill.isActive = false
        }
      }
    })
  }

  canUseSkill(type: SkillType): boolean {
    const skill = this.skills.get(type)
    if (!skill) return false
    return skill.cooldownRemaining <= 0
  }

  useSkill(type: SkillType): boolean {
    if (!this.canUseSkill(type)) return false

    const skill = this.skills.get(type)!
    const data = this.skillData.get(type)!

    skill.cooldownRemaining = data.cooldown
    skill.durationRemaining = data.duration
    skill.isActive = data.duration > 0

    return true
  }

  isSkillActive(type: SkillType): boolean {
    const skill = this.skills.get(type)
    return skill ? skill.isActive : false
  }

  getSkill(type: SkillType): SkillInstance | null {
    return this.skills.get(type) || null
  }

  getSkillData(type: SkillType): SkillData | null {
    return this.skillData.get(type) || null
  }

  getAllSkills(): SkillInstance[] {
    return Array.from(this.skills.values())
  }

  getClassSkills(): SkillType[] {
    const classSkills: SkillType[] = []
    this.skillData.forEach((data, type) => {
      if (data.classType === this.classType) {
        classSkills.push(type)
      }
    })
    return classSkills
  }
}
