export interface SpriteFrame {
  x: number
  y: number
  width: number
  height: number
}

export interface Animation {
  name: string
  frames: SpriteFrame[]
  frameRate: number
  loop: boolean
}

export class Sprite {
  private image: HTMLImageElement | null = null
  private animations: Map<string, Animation> = new Map()
  private currentAnimation: string | null = null
  private currentFrame: number = 0
  private frameTime: number = 0
  private isLoaded: boolean = false

  constructor(imagePath?: string) {
    if (imagePath) {
      this.loadImage(imagePath)
    }
  }

  loadImage(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.image = img
        this.isLoaded = true
        resolve()
      }
      img.onerror = reject
      img.src = path
    })
  }

  addAnimation(name: string, animation: Animation): void {
    this.animations.set(name, animation)
  }

  playAnimation(name: string): void {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name
      this.currentFrame = 0
      this.frameTime = 0
    }
  }

  update(deltaTime: number): void {
    if (!this.currentAnimation) return

    const animation = this.animations.get(this.currentAnimation)
    if (!animation) return

    this.frameTime += deltaTime
    const frameDuration = 1 / animation.frameRate

    if (this.frameTime >= frameDuration) {
      this.frameTime = 0
      this.currentFrame++

      if (this.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          this.currentFrame = 0
        } else {
          this.currentFrame = animation.frames.length - 1
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1): void {
    if (!this.isLoaded || !this.image) return

    if (this.currentAnimation) {
      const animation = this.animations.get(this.currentAnimation)
      if (animation && animation.frames[this.currentFrame]) {
        const frame = animation.frames[this.currentFrame]
        ctx.drawImage(
          this.image,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          x - (frame.width * scale) / 2,
          y - (frame.height * scale) / 2,
          frame.width * scale,
          frame.height * scale
        )
      }
    } else if (this.image) {
      ctx.drawImage(
        this.image,
        x - (this.image.width * scale) / 2,
        y - (this.image.height * scale) / 2,
        this.image.width * scale,
        this.image.height * scale
      )
    }
  }

  renderSimple(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (!this.isLoaded || !this.image) return
    ctx.drawImage(this.image, x, y, width, height)
  }

  getCurrentFrame(): SpriteFrame | null {
    if (!this.currentAnimation) return null
    const animation = this.animations.get(this.currentAnimation)
    if (!animation) return null
    return animation.frames[this.currentFrame] || null
  }

  isAnimationLoaded(): boolean {
    return this.isLoaded
  }
}

export class SpriteFactory {
  static createPlayerSprite(classType: string): Sprite {
    const sprite = new Sprite()

    const idleFrames: SpriteFrame[] = [{ x: 0, y: 0, width: 32, height: 32 }]
    const walkFrames: SpriteFrame[] = [
      { x: 0, y: 0, width: 32, height: 32 },
      { x: 32, y: 0, width: 32, height: 32 },
      { x: 64, y: 0, width: 32, height: 32 },
      { x: 32, y: 0, width: 32, height: 32 },
    ]

    sprite.addAnimation('idle', {
      name: 'idle',
      frames: idleFrames,
      frameRate: 1,
      loop: true,
    })

    sprite.addAnimation('walk', {
      name: 'walk',
      frames: walkFrames,
      frameRate: 8,
      loop: true,
    })

    sprite.playAnimation('idle')

    return sprite
  }

  static createMonsterSprite(monsterType: string): Sprite {
    const sprite = new Sprite()

    const idleFrames: SpriteFrame[] = [{ x: 0, y: 0, width: 32, height: 32 }]

    sprite.addAnimation('idle', {
      name: 'idle',
      frames: idleFrames,
      frameRate: 2,
      loop: true,
    })

    sprite.playAnimation('idle')

    return sprite
  }
}
