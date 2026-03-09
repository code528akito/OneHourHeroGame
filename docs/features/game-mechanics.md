# 🎮 ゲームメカニクス

**ドキュメント**: 機能仕様 / ゲームメカニクス  
**最終更新**: 2025-10-05

---

## 📊 ゲーム概要

ワンアワー・ヒーローは、制限時間内に魔王を倒すことを目指すローグライクRPGです。
選んだ時間モードとクラスによって、戦略とプレイスタイルが大きく変わります。

---

## ⏱️ タイムモードシステム

### 5つのタイムモード

| モード | 時間 | 難易度 | 目標 |
|--------|------|--------|------|
| 1分 | 60秒 | ★★★★★ | 村の周りでスライムを倒す |
| 5分 | 300秒 | ★★★★☆ | 森の奥の「炎の剣」を手に入れる |
| 10分 | 600秒 | ★★★☆☆ | 森のミニボス「古のトレント」を倒す |
| 30分 | 1800秒 | ★★☆☆☆ | 魔王城の門番を倒す |
| 60分 | 3600秒 | ★☆☆☆☆ | 魔王を倒す |

### タイマーシステム

```typescript
class TimerSystem {
  private remainingTime: number
  private maxTime: number
  private isRunning: boolean
  
  start(timeMode: TimeMode): void
  pause(): void
  resume(): void
  update(deltaTime: number): void
  getRemainingTime(): number
  getProgress(): number  // 0-100%
  isTimeUp(): boolean
}
```

#### 表示
- デジタル表示: `MM:SS`
- プログレスバー: 残り時間の視覚化
- 警告: 残り30秒で赤色表示

---

## 🎯 ゲームループ

### 基本フロー

```
1. ゲーム開始
   ↓
2. スタートの町でスポーン
   ↓
3. タイマー開始
   ↓
4. 探索・戦闘・レベルアップ
   ↓
5. ゲーム終了（時間切れ or クリア）
   ↓
6. スコア計算・ランク判定
   ↓
7. 実績解放
   ↓
8. 結果保存
```

### 60FPS ゲームループ

```typescript
function gameLoop(currentTime: number) {
  deltaTime = (currentTime - lastFrameTime) / 1000
  
  // 入力
  processInput()
  
  // 更新
  updateTimer(deltaTime)
  updatePlayer(deltaTime)
  updateMonsters(deltaTime)
  updateEffects(deltaTime)
  checkCollisions()
  checkItemCollection()
  
  // 描画
  renderGame()
  
  // 次フレーム
  requestAnimationFrame(gameLoop)
}
```

---

## 🎮 操作システム

### キーボード操作

```
移動:
  W / ↑    - 上に移動
  S / ↓    - 下に移動
  A / ←    - 左に移動
  D / →    - 右に移動

スキル:
  Q        - スキル1使用
  E        - スキル2使用

アイテム:
  1        - 回復ポーション使用
  2        - ボム使用
  3        - 聖水使用

システム:
  ESC      - ポーズメニュー
  E        - NPC会話 / 石碑調査
```

### 入力処理

```typescript
class InputHandler {
  private keys: Set<string> = new Set()
  
  handleKeyDown(e: KeyboardEvent): void {
    this.keys.add(e.key.toLowerCase())
    
    // 即座に実行するアクション
    if (e.key === 'Escape') this.pauseGame()
    if (e.key === 'e') this.interact()
    if (e.key >= '1' && e.key <= '3') this.useItem(e.key)
    if (e.key === 'q' || e.key === 'e') this.useSkill(e.key)
  }
  
  handleKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase())
  }
}
```

---

## 🚶 移動システム

### プレイヤー移動

```typescript
// 入力から方向ベクトルを計算
velocity = { x: 0, y: 0 }

if (keys.has('w')) velocity.y = -1
if (keys.has('s')) velocity.y = 1
if (keys.has('a')) velocity.x = -1
if (keys.has('d')) velocity.x = 1

// 正規化（斜め移動が速くならないように）
length = sqrt(velocity.x² + velocity.y²)
if (length > 0) {
  velocity.x /= length
  velocity.y /= length
}

// 移動速度適用
newX = position.x + velocity.x * speed * deltaTime
newY = position.y + velocity.y * speed * deltaTime

// 衝突判定
if (isWalkable(newX, newY)) {
  position = { x: newX, y: newY }
}
```

### クラス別速度

| クラス | 速度 | 備考 |
|--------|------|------|
| 騎士 | 150 | 標準 |
| 魔法使い | 120 | 遅い（-20%） |
| 盗賊 | 180 | 速い（+20%） |
| 弓使い | 100 | 最も遅い（-33%） |

### スキル効果

- **ウィンドウォーク**（盗賊）: 移動速度2倍（10秒間）

---

## ⚔️ 戦闘システム

### 接触戦闘

```typescript
function checkCollisions() {
  const playerPos = player.getPosition()
  const playerSize = player.getSize()
  
  monsters.forEach(monster => {
    const distance = calculateDistance(playerPos, monster.getPosition())
    const collisionDistance = (playerSize + monster.getSize()) / 2
    
    if (distance < collisionDistance) {
      // 相互ダメージ
      player.takeDamage(monster.getAttack())
      monster.takeDamage(player.getAttack())
      
      // エフェクト表示
      showDamageText(playerPos, damage)
      showHitFlash(playerPos)
      
      // 死亡判定
      if (!monster.isAlive()) {
        player.addExp(monster.getExp())
        monstersDefeated++
      }
      if (!player.isAlive()) {
        gameOver()
      }
    }
  })
}
```

### ダメージ計算

```typescript
// 基本ダメージ計算
baseDamage = attacker.attack
actualDamage = max(1, baseDamage - defender.defense)

// スキル効果
if (powerSmashActive) actualDamage *= 2
if (firstStrikeActive) actualDamage *= 3
if (ironWallActive) actualDamage *= 0.5

// 装備ボーナス
actualDamage += equipmentBonus.attack

// 適用
defender.hp -= actualDamage
```

### 魔法攻撃（魔法使い）

```typescript
function useMagicAttack(skillType: string, position: Vector2) {
  let damage = 0
  let range = 0
  
  if (skillType === 'FIREBALL') {
    damage = 100
    range = 80
  } else if (skillType === 'THUNDERBOLT') {
    damage = 200
    range = 120
  }
  
  // 範囲内の敵にダメージ
  monsters.forEach(monster => {
    if (distance(monster, position) < range) {
      monster.takeDamage(damage)
      showExplosion(position, range)
    }
  })
}
```

### 遠距離射撃（弓使い）

```typescript
function usePiercingArrow(position: Vector2) {
  const target = findNearestEnemy(position, 280)
  if (target) {
    target.takeDamage(160)
    showHitFlash(target.position)
  }
}

function useArrowRain(position: Vector2) {
  const targets = monsters
    .filter(monster => distance(monster, position) <= 320)
    .sort(byNearestTo(position))
    .slice(0, 3)

  targets.forEach(monster => {
    monster.takeDamage(120)
    showHitFlash(monster.position)
  })
}

function updateArcherAutoAttack(position: Vector2) {
  const target = findNearestEnemy(position, 260)
  if (target) {
    target.takeDamage(player.getAttackPower())
    showHitFlash(target.position)
  }
}
```

---

## 📊 レベルシステム

### 経験値とレベルアップ

```typescript
class Player {
  private stats: PlayerStats = {
    level: 1,
    exp: 0,
    maxExp: 100,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5
  }
  
  addExp(amount: number): boolean {
    this.stats.exp += amount
    
    if (this.stats.exp >= this.stats.maxExp) {
      this.levelUp()
      return true
    }
    return false
  }
  
  private levelUp(): void {
    this.stats.level++
    this.stats.exp -= this.stats.maxExp
    this.stats.maxExp = floor(this.stats.maxExp * 1.5)
    
    // ステータス成長
    this.stats.maxHp += 10
    this.stats.hp = this.stats.maxHp  // 全回復
    this.stats.attack += 2
    this.stats.defense += 1
    
    // エフェクト表示
    showLevelUpEffect(this.position)
  }
}
```

### レベル必要経験値テーブル

| レベル | 必要経験値 | 累計経験値 |
|--------|-----------|-----------|
| 1→2 | 100 | 100 |
| 2→3 | 150 | 250 |
| 3→4 | 225 | 475 |
| 4→5 | 338 | 813 |
| 5→6 | 507 | 1,320 |
| ... | ... | ... |
| 19→20 | ~10,000 | ~50,000 |

---

## 🎯 当たり判定

### 円形コリジョン

```typescript
function checkCollision(a: Entity, b: Entity): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const distance = sqrt(dx * dx + dy * dy)
  const minDistance = (a.size + b.size) / 2
  
  return distance < minDistance
}
```

### マップコリジョン

```typescript
function isWalkable(x: number, y: number): boolean {
  const tileX = floor(x / tileSize)
  const tileY = floor(y / tileSize)
  
  // 境界チェック
  if (tileX < 0 || tileX >= width || 
      tileY < 0 || tileY >= height) {
    return false
  }
  
  // タイルタイプチェック
  const tile = getTile(tileX, tileY)
  return tile.walkable
}
```

---

## 📦 アイテム収集

### 自動収集システム

```typescript
function checkItemCollection() {
  const playerPos = player.getPosition()
  const nearbyItem = map.getNearbyWorldItem(playerPos, 40)
  
  if (nearbyItem) {
    if (nearbyItem.isEquipment) {
      // 装備アイテム
      itemSystem.equipItem(nearbyItem.type)
      map.collectWorldItem(nearbyItem.id)
      showItemPickupEffect(playerPos, nearbyItem.name)
    } else {
      // 消費アイテム
      if (itemSystem.addItem(nearbyItem.type)) {
        map.collectWorldItem(nearbyItem.id)
        itemsCollected++
      }
    }
  }
}
```

---

## 🎬 ゲーム終了

### 終了条件

1. **タイムアップ**: 制限時間が0になる
2. **プレイヤー死亡**: HPが0になる
3. **手動終了**: ポーズメニューから終了

### スコア計算

```typescript
function calculateScore(result: GameResult): number {
  let score = 0
  
  // 残り時間ボーナス
  score += result.remainingTime * 10
  
  // レベルボーナス
  score += result.playerLevel * 100
  
  // 撃破数ボーナス
  score += result.monstersDefeated * 50
  
  // アイテム収集ボーナス
  score += result.itemsCollected * 20
  
  // クリアボーナス
  if (result.cleared) {
    score += 5000
  }
  
  return score
}
```

### ランク判定

```typescript
function calculateRank(score: number): string {
  if (score >= 20000) return 'S'
  if (score >= 15000) return 'A'
  if (score >= 10000) return 'B'
  return 'C'
}
```

---

## 🔗 関連ドキュメント

- [クラスシステム](class-system.md)
- [モンスターシステム](monster-system.md)
- [スキルシステム](skill-system.md)
- [アイテムシステム](item-system.md)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0
