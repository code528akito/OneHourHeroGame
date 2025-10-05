# 設計ドキュメント - ワンアワー・ヒーロー

## 概要

「ワンアワー・ヒーロー」は、HTML5/Canvas 技術を使用したブラウザベースのリアルタイムアクション RPG です。ゲームエンジンとして軽量で高速な描画が可能なフレームワークを採用し、60FPS での滑らかな動作を実現します。ゲームの状態管理は状態機械パターンを使用し、タイマー、戦闘、マップ探索などの各システムを疎結合に保ちます。

## アーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │     Game Application Layer              │            │
│  │  (ゲームループ、入力処理、レンダリング)  │            │
│  └─────────────────────────────────────────┘            │
│                      │                                   │
│          ┌───────────┼───────────┐                      │
│          │           │           │                      │
│  ┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────┐         │
│  │ Game State   │ │  Systems  │ │ Rendering │         │
│  │ Manager      │ │  Layer    │ │  Engine   │         │
│  └───────┬──────┘ └──┬────────┘ └┬──────────┘         │
│          │           │            │                     │
│          │  ┌────────▼────────┐   │                     │
│          │  │ Timer System    │   │                     │
│          │  │ Combat System   │   │                     │
│          │  │ Map System      │   │                     │
│          │  │ Player System   │   │                     │
│          │  │ Sprite System   │   │                     │
│          │  └─────────────────┘   │                     │
│          │                        │                     │
│  ┌───────▼────────────────────────▼────────┐           │
│  │      Data Layer (Models)                │           │
│  │  (Player, Monster, Item, Map, Score)    │           │
│  └─────────────────────────────────────────┘           │
│                      │                                   │
│  ┌───────────────────▼───────────────────┐             │
│  │      API Client (Fetch)               │             │
│  └───────────────────────────────────────┘             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / REST API
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Backend (Node.js + Express)               │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │         API Routes Layer                │            │
│  │  (/auth, /player, /scores, /achievements)│           │
│  └─────────────────┬───────────────────────┘            │
│                    │                                     │
│  ┌─────────────────▼───────────────────┐                │
│  │      Middleware Layer               │                │
│  │  (認証、バリデーション、エラー処理)  │                │
│  └─────────────────┬───────────────────┘                │
│                    │                                     │
│  ┌─────────────────▼───────────────────┐                │
│  │      Service Layer                  │                │
│  │  (ビジネスロジック、スコア検証)      │                │
│  └─────────────────┬───────────────────┘                │
│                    │                                     │
│  ┌─────────────────▼───────────────────┐                │
│  │      Data Access Layer (Prisma)     │                │
│  └─────────────────┬───────────────────┘                │
└────────────────────┼─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│              Database (PostgreSQL)                        │
│  (users, player_profiles, scores, achievements, etc.)    │
└───────────────────────────────────────────────────────────┘
```

### 技術スタック

**フロントエンド:**

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **状態管理**: Zustand（軽量で高速）
- **ルーティング**: React Router
- **UI**: Tailwind CSS（メニュー画面用）
- **ゲームレンダリング**: HTML5 Canvas API
- **ゲームループ**: requestAnimationFrame
- **グラフィック**: ドット絵スプライト + スプライトアニメーション
- **HTTP 通信**: Axios

**バックエンド:**

- **言語**: Go (Golang)
- **フレームワーク**: Gin（高速な HTTP ルーター）
- **データベース**: PostgreSQL
- **ORM**: GORM
- **認証**: JWT (JSON Web Token)
- **パスワードハッシュ**: bcrypt
- **バリデーション**: go-playground/validator

**理由:**

- **React**: コンポーネントベースで UI 管理が容易、Canvas 統合も簡単
- **Go**: 高速、並行処理に強い、型安全、デプロイが簡単（単一バイナリ）、メモリ効率が良い

## フロントエンドコンポーネント構造（React）

### React コンポーネント階層

```
App
├── AuthProvider (認証コンテキスト)
├── Router
    ├── LoginPage
    ├── RegisterPage
    ├── MainMenuPage
    │   ├── ModeSelector
    │   ├── LeaderboardView ✅ 実装済み (2025-10-04)
    │   └── AchievementsView ✅ 実装済み (2025-10-04)
    ├── GamePage
    │   ├── GameCanvas (Canvas統合)
    │   ├── TimerDisplay
    │   ├── PlayerHUD (HP、レベルなど)
    │   └── PauseMenu
    └── ResultPage
        ├── ScoreDisplay
        ├── RankDisplay
        └── AchievementUnlockNotification
```

### 状態管理（Zustand）

```typescript
// ゲーム状態ストア
interface GameStore {
  // 認証
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;

  // ゲーム状態
  gameState: GameState;
  timeMode: TimeMode | null;
  currentScore: number;

  // プレイヤーデータ
  profile: PlayerProfile | null;
  achievements: UserAchievement[];

  // アクション
  startGame: (mode: TimeMode) => void;
  endGame: (result: GameResult) => Promise<void>;
  loadProfile: () => Promise<void>;
}
```

## ゲームエンジンコンポーネント

### 1. Game State Manager

ゲーム全体の状態を管理するコアコンポーネント。

```typescript
enum GameState {
  TITLE_SCREEN,
  MODE_SELECT,
  PLAYING,
  PAUSED,
  GAME_OVER,
  GAME_CLEAR,
}

interface IGameStateManager {
  currentState: GameState;
  changeState(newState: GameState): void;
  update(deltaTime: number): void;
}
```

**責務:**

- ゲーム状態の遷移管理
- 各状態に応じた更新処理の振り分け
- 状態遷移時のイベント発火

### 2. Timer System

リアルタイムタイマーを管理するシステム。

```typescript
enum TimeMode {
  ONE_MINUTE = 60,
  FIVE_MINUTES = 300,
  TEN_MINUTES = 600,
  THIRTY_MINUTES = 1800,
  SIXTY_MINUTES = 3600,
}

interface ITimerSystem {
  remainingTime: number;
  timeMode: TimeMode;
  isRunning: boolean;

  start(mode: TimeMode): void;
  pause(): void;
  resume(): void;
  update(deltaTime: number): void;
  getFormattedTime(): string; // "MM:SS" 形式
  isTimeUp(): boolean;
}
```

**責務:**

- 選択された時間モードに基づくタイマーの初期化
- 毎フレームの時間減算
- タイムアップの検知
- UI 表示用の時間フォーマット

### 3. Combat System

セミオートバトルを管理するシステム。

```typescript
interface ICombatSystem {
  isInCombat: boolean;
  currentEnemy: Monster | null;
  autoAttackCooldown: number;

  startCombat(enemy: Monster): void;
  endCombat(): void;
  update(deltaTime: number): void;
  useSkill(skillId: string): boolean;
  useItem(itemId: string): boolean;
}

interface IAutoAttackController {
  attackInterval: number; // 自動攻撃の間隔（秒）
  timeSinceLastAttack: number;

  update(deltaTime: number, player: Player, enemy: Monster): void;
  executeAttack(attacker: Entity, target: Entity): void;
}
```

**責務:**

- 戦闘の開始と終了
- 自動攻撃のタイミング制御
- スキルとアイテムの使用処理
- ダメージ計算と適用
- 戦闘時間の最適化（5〜15 秒）

### 4. Map System

固定マップの管理と探索を担当。

```typescript
interface IMapSystem {
  currentMap: GameMap;
  playerPosition: Vector2;

  loadMap(mapId: string): void;
  movePlayer(direction: Vector2): boolean;
  checkCollision(position: Vector2): CollisionResult;
  getEntitiesAt(position: Vector2): Entity[];
  getNPCsInRange(position: Vector2, range: number): NPC[];
}

interface GameMap {
  id: string;
  width: number;
  height: number;
  tiles: Tile[][];
  monsters: Monster[];
  npcs: NPC[];
  items: Item[];
  areas: Area[]; // 始まりの平原、ささやきの森など
}

interface Area {
  id: string;
  name: string;
  bounds: Rectangle;
  requiredForMode: TimeMode[]; // このエリアがどの時間モードで必要か
}
```

**責務:**

- マップデータの読み込みと管理
- プレイヤーの移動処理
- 衝突判定
- エンティティ（モンスター、NPC、アイテム）の配置と取得

### 5. Player System

プレイヤーの状態とクラスを管理。

```typescript
interface IPlayerSystem {
  player: Player;

  initialize(classType: ClassType): void;
  levelUp(): void;
  equipItem(item: Equipment): void;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  addExperience(amount: number): void;
}

interface Player extends Entity {
  classType: ClassType;
  level: number;
  experience: number;
  equipment: {
    weapon: Weapon | null;
    armor: Armor | null;
    accessory: Accessory | null;
  };
  skills: Skill[];
  inventory: {
    healingPotions: number;
    bombs: number;
    holyWater: number;
  };
}

enum ClassType {
  KNIGHT,
  MAGE,
  THIEF,
}

interface Skill {
  id: string;
  name: string;
  cooldown: number;
  currentCooldown: number;
  effect: (player: Player, target?: Entity) => void;
}
```

**責務:**

- プレイヤーステータスの管理
- レベルアップ処理と HP 全回復
- 装備の自動最適化
- スキルのクールダウン管理

### Monster System

**実装済みモンスター（2025-01-XX）:**

**序盤エリア（始まりの平原・ささやきの森）:**
- **スライム (SLIME)**: HP 15, 攻撃 3, 防御 1, AIType: PASSIVE（動かない）
- **ゴブリン (GOBLIN)**: HP 30, 攻撃 6, 防御 2, AIType: AGGRESSIVE（プレイヤーに近づく）
- **森のオオカミ (WOLF)**: HP 40, 攻撃 10, 防御 3, AIType: FAST_ATTACK（素早い攻撃）
- **古のトレント (TRENT)**: HP 150, 攻撃 15, 防御 10, AIType: BOSS（ミニボス）

**中盤エリア（クリスタルの洞窟）:**
- **ロックゴーレム (ROCK_GOLEM)**: HP 80, 攻撃 12, 防御 15, AIType: HIGH_DEFENSE（高防御力、低速）
- **ジャイアントバット (GIANT_BAT)**: HP 35, 攻撃 14, 防御 2, AIType: FAST_ATTACK（素早い）
- **クリスタル・リザード (CRYSTAL_LIZARD)**: HP 200, 攻撃 20, 防御 12, AIType: BOSS（ミニボス）

**終盤エリア（灼熱火山・魔王城）:**
- **ヘルハウンド (HELLHOUND)**: HP 60, 攻撃 18, 防御 5, AIType: FAST_ATTACK（継続ダメージ予定）
- **魔王軍・近衛騎士 (ROYAL_GUARD)**: HP 120, 攻撃 25, 防御 18, AIType: HIGH_DEFENSE（高ステータス全般）
- **魔王 (DEMON_LORD)**: HP 500, 攻撃 40, 防御 20, AIType: BOSS（最終ボス、3形態予定）

**実装済みマップエリア（2025-01-XX）:**
- スタートの町
- 始まりの平原（スライム、ゴブリン配置）
- ささやきの森（オオカミ、古のトレント配置）
- クリスタルの洞窟（ゴーレム、バット、クリスタル・リザード配置）
- 灼熱火山・魔王城（ヘルハウンド、近衛騎士、魔王配置）

モンスターの AI と行動を管理。

```typescript
interface IMonsterSystem {
  activeMonsters: Monster[];

  spawnMonster(monsterId: string, position: Vector2): Monster;
  updateMonsters(deltaTime: number): void;
  removeMonster(monster: Monster): void;
}

interface Monster extends Entity {
  monsterId: string;
  aiType: AIType;
  weaknesses: ElementType[];
  resistances: ElementType[];
  specialAbilities: SpecialAbility[];
  dropTable: DropTable;
}

enum AIType {
  PASSIVE, // スライム
  AGGRESSIVE, // ゴブリン
  FAST_ATTACK, // 森のオオカミ
  HIGH_DEFENSE, // ロックゴーレム
  BOSS, // ミニボス、魔王
}

interface SpecialAbility {
  id: string;
  trigger: AbilityTrigger;
  effect: (monster: Monster, target?: Entity) => void;
}
```

**責務:**

- モンスターのスポーンと削除
- AI に基づく行動決定
- 特殊能力の発動
- ドロップアイテムの生成

### 7. Score System

スコア計算とローカルランキング管理。

```typescript
interface IScoreSystem {
  calculateScore(result: GameResult): number;
  saveScore(score: number, mode: TimeMode): void;
  getLocalBestScores(mode: TimeMode): ScoreRecord[];
  getAllTimeRecords(): ScoreRecord[];
}

interface GameResult {
  timeMode: TimeMode;
  remainingTime: number;
  playerLevel: number;
  achievedEvents: string[]; // 達成したイベント（ボス撃破など）
  itemsCollected: number;
  monstersDefeated: number;
  cleared: boolean;
}

interface ScoreRecord {
  score: number;
  timeMode: TimeMode;
  rank: ScoreRank;
  timestamp: Date;
}

enum ScoreRank {
  S,
  A,
  B,
  C,
}
```

**責務:**

- ゲーム結果に基づくスコア算出
- サーバーへのスコア保存とローカル取得
- ランク判定
- 時間モード別のベストスコア管理
- **重複保存防止**: 10秒以内の同一スコア保存を防止（サーバー側）
- **クライアント側重複防止**: useRefとuseEffectによる確実な状態管理

**実装済みスコア計算式（2025-10-04）:**

```typescript
スコア = (レベル × 100) 
       + (モンスター討伐数 × 50)
       + (アイテム収集数 × 30)
       + (残り時間(秒) × 10)
       + クリアボーナス(1000)
       + 時間モードボーナス
```

**時間モードボーナス（クリア時のみ）:**
- 1分モード: 5000点
- 5分モード: 4000点
- 10分モード: 3000点
- 30分モード: 2000点
- 60分モード: 1000点

**ランク判定基準:**

| 時間モード | Sランク | Aランク | Bランク | Cランク |
|-----------|---------|---------|---------|---------|
| 1分       | 8000+   | 6000+   | 4000+   | クリア  |
| 5分       | 10000+  | 7500+   | 5000+   | クリア  |
| 10分      | 12000+  | 9000+   | 6000+   | クリア  |
| 30分      | 15000+  | 11000+  | 7500+   | クリア  |
| 60分      | 20000+  | 15000+  | 10000+  | クリア  |

※ 未クリアの場合は自動的にCランク

### 8. Sprite and Animation System

ドット絵スプライトとアニメーションを管理。

```typescript
interface ISpriteSystem {
  loadSpriteSheet(id: string, path: string): Promise<void>;
  getSprite(id: string): SpriteSheet;
  createAnimation(spriteId: string, frames: number[], fps: number): Animation;
}

interface SpriteSheet {
  id: string;
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
}

interface Animation {
  spriteSheet: SpriteSheet;
  frames: number[]; // フレームインデックスの配列
  currentFrame: number;
  fps: number;
  elapsedTime: number;
  loop: boolean;

  update(deltaTime: number): void;
  reset(): void;
  getCurrentFrame(): number;
}

interface IAnimationController {
  animations: Map<string, Animation>;
  currentAnimation: string;

  addAnimation(name: string, animation: Animation): void;
  play(name: string, loop?: boolean): void;
  update(deltaTime: number): void;
  getCurrentSprite(): { sheet: SpriteSheet; frame: number };
}
```

**責務:**

- スプライトシートの読み込みと管理
- フレームベースのアニメーション制御
- アニメーション状態の管理（待機、移動、攻撃など）
- 滑らかなアニメーション再生

**アニメーションの種類:**

- **プレイヤー**: 待機、上下左右移動、攻撃、スキル使用、ダメージ
- **モンスター**: 待機、移動、攻撃、ダメージ、死亡
- **エフェクト**: スキルエフェクト、ヒットエフェクト、回復エフェクト

### 9. Achievement System

実績と解放要素を管理。

```typescript
interface IAchievementSystem {
  achievements: Achievement[];
  unlockedClasses: ClassType[];

  checkAchievements(result: GameResult): Achievement[];
  unlockAchievement(achievementId: string): void;
  isClassUnlocked(classType: ClassType): boolean;
  unlockClass(classType: ClassType): void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (result: GameResult) => boolean;
  reward: AchievementReward;
  unlocked: boolean;
}

interface AchievementReward {
  type: RewardType;
  value: string; // クラスID、称号名など
}

enum RewardType {
  CLASS_UNLOCK,
  TITLE,
  HIDDEN_CONTENT,
}
```

**責務:**

- 実績の条件チェック
- 実績解放時の報酬付与
- クラス解放の管理
- 隠しコンテンツの出現制御

## データモデル

### Entity (基底クラス)

```typescript
interface Entity {
  id: string;
  name: string;
  position: Vector2;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}
```

### Equipment

```typescript
interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  stats: StatModifiers;
  specialEffects: SpecialEffect[];
}

enum EquipmentType {
  WEAPON,
  ARMOR,
  ACCESSORY,
}

interface StatModifiers {
  attack?: number;
  defense?: number;
  speed?: number;
  maxHp?: number;
}
```

### Item

```typescript
interface Item {
  id: string;
  name: string;
  type: ItemType;
  maxStack: number;
  effect: (player: Player) => void;
}

enum ItemType {
  HEALING_POTION,
  BOMB,
  HOLY_WATER,
}
```

**実装済みアイテム詳細（2025-10-04）:**

| アイテム | キー | 効果 | 最大所持数 | クールダウン | 初期所持 |
|---------|------|------|-----------|-------------|---------|
| 回復ポーション | 1 | HP 50回復 | 5 | 3秒 | 3個 |
| ボム | 2 | 範囲100内の敵に50ダメージ（防御無視） | 3 | 5秒 | 2個 |
| 聖水 | 3 | 状態異常解除 | 3 | 10秒 | 1個 |

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  classType: ClassType;
  cooldown: number;
  duration?: number;
  effect: SkillEffect;
}

interface SkillEffect {
  type: SkillEffectType;
  value: number;
  duration?: number;
}

enum SkillEffectType {
  ATTACK_BOOST,    // 攻撃力上昇
  DEFENSE_BOOST,   // 防御力上昇
  SPEED_BOOST,     // 移動速度上昇
  DIRECT_DAMAGE,   // 直接ダメージ
  CRITICAL,        // クリティカル確定
}
```

**実装済みスキル詳細（2025-10-04）:**

**騎士（KNIGHT）**
- **パワースマッシュ** (Q): 次の攻撃威力2倍、持続5秒、CD 10秒
- **アイアンウォール** (E): ダメージ50%軽減、持続8秒、CD 15秒

**魔法使い（MAGE）**
- **ファイアボール** (Q): 魔法攻撃100ダメージ、CD 8秒
- **サンダーボルト** (E): 魔法攻撃200ダメージ、CD 20秒

**盗賊（THIEF）**
- **ファーストストライク** (Q): 次の攻撃がクリティカル、持続3秒、CD 12秒
- **ウィンドウォーク** (E): 移動速度2倍、持続10秒、CD 15秒

## エラーハンドリング

### エラーの種類と対処

1. **タイマーエラー**

   - 原因: システム時刻の異常、deltaTime の異常値
   - 対処: deltaTime の上限設定（最大 1 秒）、異常検知時のゲーム一時停止

2. **戦闘エラー**

   - 原因: 無効なスキル使用、存在しないモンスターへの攻撃
   - 対処: null チェック、スキル使用前の条件検証

3. **マップエラー**

   - 原因: マップデータの読み込み失敗、無効な座標への移動
   - 対処: デフォルトマップへのフォールバック、座標の境界チェック

4. **データ永続化エラー**

   - 原因: LocalStorage の容量不足、アクセス権限エラー
   - 対処: try-catch による例外処理、メモリ内での一時保存

5. **リソース読み込みエラー**
   - 原因: スプライトシートや画像の読み込み失敗
   - 対処: デフォルト画像へのフォールバック、リトライ機構

### エラーログ

```typescript
interface IErrorLogger {
  logError(error: GameError): void;
  getErrorHistory(): GameError[];
}

interface GameError {
  timestamp: Date;
  type: ErrorType;
  message: string;
  stack?: string;
}

enum ErrorType {
  TIMER_ERROR,
  COMBAT_ERROR,
  MAP_ERROR,
  DATA_ERROR,
  RESOURCE_ERROR,
}
```

## テスト戦略

### 1. ユニットテスト

各システムとコンポーネントの単体テスト。

**対象:**

- Timer System: 時間減算、フォーマット、タイムアップ検知
- Combat System: ダメージ計算、スキル効果、戦闘時間
- Player System: レベルアップ、装備自動最適化、ステータス計算
- Score System: スコア算出ロジック、ランク判定
- Achievement System: 実績条件チェック、報酬付与

**ツール:** Jest または Vitest

### 2. 統合テスト

複数システムの連携テスト。

**シナリオ:**

- プレイヤーがモンスターと遭遇し、戦闘を行い、経験値を得てレベルアップする
- タイマーが動作中に戦闘が発生し、時間が正しく減少する
- 装備を拾い、自動で最強装備が選択される
- ゲーム終了時にスコアが正しく算出され、実績がチェックされる

### 3. パフォーマンステスト

60FPS 維持の検証。

**測定項目:**

- フレームレート（目標: 60FPS）
- 各システムの更新時間（目標: 16ms 以下）
- メモリ使用量
- 長時間プレイ時の安定性

**ツール:** Chrome DevTools Performance Profiler

### 4. プレイテスト

実際のゲームプレイを通じた検証。

**検証項目:**

- 各時間モードの難易度バランス
- 戦闘時間が 5〜15 秒に収まるか
- 初回プレイでのクリア不可能性
- 繰り返しプレイでの学習曲線
- UI/UX の快適性

### 5. エンドツーエンドテスト

ゲーム全体のフローテスト。

**シナリオ:**

- タイトル画面 → モード選択 → ゲームプレイ → ゲームオーバー → スコア表示
- タイトル画面 → モード選択 → ゲームプレイ → ゲームクリア → スコア表示 → 実績解放
- 各時間モードでの完全プレイスルー

## パフォーマンス最適化

### 1. レンダリング最適化

- **ダーティフラグ**: 変更があった部分のみ再描画
- **オブジェクトプーリング**: モンスターやエフェクトの再利用
- **カリング**: 画面外のエンティティは描画をスキップ

### 2. 計算最適化

- **空間分割**: マップを格子状に分割し、近接エンティティのみ処理
- **キャッシング**: 頻繁に使用する計算結果をキャッシュ
- **遅延評価**: 必要になるまで計算を遅延

### 3. メモリ最適化

- **リソースの事前読み込み**: ゲーム開始時に全リソースをロード
- **不要なオブジェクトの削除**: 戦闘終了後のモンスターなど
- **データ構造の最適化**: 配列より Map や Set を適切に使用

## データベース設計

### データベーススキーマ

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- プレイヤープロフィールテーブル
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  unlocked_classes TEXT[] DEFAULT ARRAY['KNIGHT'],
  total_play_time INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  total_monsters_defeated INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- スコアテーブル
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  time_mode VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  rank VARCHAR(1) NOT NULL,
  remaining_time INTEGER NOT NULL,
  player_level INTEGER NOT NULL,
  items_collected INTEGER NOT NULL,
  monsters_defeated INTEGER NOT NULL,
  cleared BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_scores (user_id, time_mode, score DESC),
  INDEX idx_leaderboard (time_mode, score DESC, created_at DESC)
);

-- 実績テーブル
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  reward_type VARCHAR(20) NOT NULL,
  reward_value VARCHAR(50)
);

-- ユーザー実績テーブル
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, achievement_id)
);

-- 設定テーブル
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sound_volume FLOAT DEFAULT 1.0,
  music_volume FLOAT DEFAULT 1.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Go モデル定義（GORM）

```go
// User モデル
type User struct {
    ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    Username     string    `gorm:"uniqueIndex;not null;size:50"`
    PasswordHash string    `gorm:"not null;size:255"`
    CreatedAt    time.Time
    UpdatedAt    time.Time

    Profile       PlayerProfile
    Scores        []Score
    Achievements  []UserAchievement
    Settings      UserSettings
}

// PlayerProfile モデル
type PlayerProfile struct {
    ID                    uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    UserID                uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
    UnlockedClasses       pq.StringArray `gorm:"type:text[];default:'{KNIGHT}'"`
    TotalPlayTime         int       `gorm:"default:0"`
    TotalGamesPlayed      int       `gorm:"default:0"`
    TotalMonstersDefeated int       `gorm:"default:0"`
    CreatedAt             time.Time
    UpdatedAt             time.Time

    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// Score モデル
type Score struct {
    ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    UserID           uuid.UUID `gorm:"type:uuid;not null;index:idx_user_scores"`
    TimeMode         string    `gorm:"not null;size:20;index:idx_leaderboard"`
    Score            int       `gorm:"not null;index:idx_user_scores,idx_leaderboard"`
    Rank             string    `gorm:"not null;size:1"`
    RemainingTime    int       `gorm:"not null"`
    PlayerLevel      int       `gorm:"not null"`
    ItemsCollected   int       `gorm:"not null"`
    MonstersDefeated int       `gorm:"not null"`
    Cleared          bool      `gorm:"not null"`
    CreatedAt        time.Time `gorm:"index:idx_leaderboard"`

    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// Achievement モデル
type Achievement struct {
    ID          string `gorm:"primary_key;size:50"`
    Name        string `gorm:"not null;size:100"`
    Description string `gorm:"not null;type:text"`
    RewardType  string `gorm:"not null;size:20"`
    RewardValue string `gorm:"size:50"`

    Users []UserAchievement
}

// UserAchievement モデル
type UserAchievement struct {
    ID            uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    UserID        uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_achievement"`
    AchievementID string    `gorm:"not null;size:50;uniqueIndex:idx_user_achievement"`
    UnlockedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP"`

    User        User        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
    Achievement Achievement `gorm:"foreignKey:AchievementID"`
}

// UserSettings モデル
type UserSettings struct {
    UserID      uuid.UUID `gorm:"type:uuid;primary_key"`
    SoundVolume float32   `gorm:"default:1.0"`
    MusicVolume float32   `gorm:"default:1.0"`
    UpdatedAt   time.Time

    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
```

### API 設計

**認証エンドポイント:**

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

**プレイヤーデータエンドポイント:**

```
GET  /api/player/profile
PUT  /api/player/profile
GET  /api/player/settings
PUT  /api/player/settings
```

**スコアエンドポイント:**

```
POST /api/scores
GET  /api/scores/my?timeMode={mode}
GET  /api/scores/leaderboard?timeMode={mode}&limit={limit}
GET  /api/scores/best?timeMode={mode}
```

**実績エンドポイント:**

```
GET  /api/achievements
GET  /api/achievements/my
POST /api/achievements/unlock
```

### バックエンドサービス層（Go）

```go
// AuthService - 認証サービス
type AuthService interface {
    Register(username, password string) (*AuthResponse, error)
    Login(username, password string) (*AuthResponse, error)
    ValidateToken(token string) (*User, error)
}

// PlayerService - プレイヤーサービス
type PlayerService interface {
    GetProfile(userID uuid.UUID) (*PlayerProfile, error)
    UpdateProfile(userID uuid.UUID, data *UpdateProfileRequest) (*PlayerProfile, error)
}

// ScoreService - スコアサービス
type ScoreService interface {
    SaveScore(userID uuid.UUID, scoreData *ScoreData) (*Score, error)
    GetMyScores(userID uuid.UUID, timeMode string) ([]Score, error)
    GetBestScore(userID uuid.UUID, timeMode string) (*Score, error)
    GetLeaderboard(timeMode string, limit int) ([]Score, error)
    ValidateScore(scoreData *ScoreData) error // スコア改ざん検証
}

// AchievementService - 実績サービス
type AchievementService interface {
    GetAllAchievements() ([]Achievement, error)
    GetMyAchievements(userID uuid.UUID) ([]UserAchievement, error)
    UnlockAchievement(userID uuid.UUID, achievementID string) (*UserAchievement, error)
    CheckAchievements(userID uuid.UUID, gameResult *GameResult) ([]Achievement, error)
}

// SettingsService - 設定サービス
type SettingsService interface {
    GetSettings(userID uuid.UUID) (*UserSettings, error)
    UpdateSettings(userID uuid.UUID, settings *UpdateSettingsRequest) (*UserSettings, error)
}

// レスポンス型
type AuthResponse struct {
    Token string `json:"token"`
    User  struct {
        ID       uuid.UUID `json:"id"`
        Username string    `json:"username"`
    } `json:"user"`
}
```

### フロントエンド API クライアント（TypeScript）

```typescript
// Axiosベースのクライアント
class GameAPIClient {
  private axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // JWTトークンを自動付与
    this.axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // 認証
  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axios.post("/api/auth/register", {
      username,
      password,
    });
    return response.data;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axios.post("/api/auth/login", {
      username,
      password,
    });
    return response.data;
  }

  // スコア
  async saveScore(scoreData: ScoreData): Promise<Score> {
    const response = await this.axios.post("/api/scores", scoreData);
    return response.data;
  }

  async getLeaderboard(
    timeMode: TimeMode,
    limit: number = 10
  ): Promise<Score[]> {
    const response = await this.axios.get(`/api/scores/leaderboard`, {
      params: { timeMode, limit },
    });
    return response.data;
  }

  // その他のメソッド...
}
```

**機能:**

- JWT 認証によるセキュアな API 通信
- 自動トークン付与（Axios インターセプター）
- データのバリデーション
- エラーハンドリングとリトライ
- オフライン時の一時保存（LocalStorage をキャッシュとして使用）

## セキュリティ考慮事項

### 1. 認証とセッション管理

- **パスワードハッシュ化**: bcrypt を使用（ソルト付き）
- **JWT 認証**: トークンベースの認証
- **トークン有効期限**: 7 日間（リフレッシュトークンは 30 日間）
- **HTTPS 通信**: 本番環境では必須

### 2. API セキュリティ

- **レート制限**: 同一 IP からの過剰なリクエストを制限
- **入力バリデーション**: 全ての API 入力を検証
- **SQL インジェクション対策**: Prisma ORM による自動エスケープ
- **CORS 設定**: 許可されたオリジンのみアクセス可能

### 3. スコア改ざん防止

- **サーバー側検証**: スコア計算ロジックをサーバー側で再実行
- **異常値検出**: 統計的に異常なスコアを自動検知
- **ゲームログ送信**: 主要なゲームイベントをログとして送信し、検証

### 4. データ整合性

- **トランザクション**: 複数テーブルの更新は原子性を保証
- **外部キー制約**: データベースレベルでの整合性保証
- **バックアップ**: 定期的な自動バックアップ

### 5. プライバシー

- **最小限の情報収集**: ユーザー名とパスワードのみ
- **パスワードリセット**: メール認証による安全なリセット
- **データ削除**: ユーザーによるアカウント削除機能

## グラフィックとアニメーション仕様

### ドット絵スプライト仕様

**キャラクタースプライト:**

- サイズ: 32x32 ピクセル（キャラクター本体）
- フォーマット: PNG（透過背景）
- スプライトシート形式: 横並び配置

**アニメーションフレーム数:**

- 待機: 4 フレーム（ループ）
- 移動: 4 フレーム × 4 方向（上下左右）
- 攻撃: 3 フレーム
- ダメージ: 2 フレーム
- 死亡: 4 フレーム

**エフェクトスプライト:**

- サイズ: 可変（16x16 〜 64x64）
- 種類: 斬撃、魔法弾、爆発、回復など
- フレーム数: 4〜8 フレーム

**マップタイル:**

- サイズ: 32x32 ピクセル
- 種類: 草地、森、洞窟、城など
- タイルセット形式で管理

### アニメーション再生仕様

- **FPS**: 8〜12 FPS（ドット絵らしい動き）
- **補間**: なし（ピクセルパーフェクト）
- **スケーリング**: 整数倍のみ（2x、3x など）

## デプロイメント戦略

### 1. ビルドプロセス

**フロントエンド:**

```
TypeScript → Babel → Webpack → 最適化 → 静的ファイル生成
```

**バックエンド:**

```
Go → go build → 単一バイナリ
GORM → マイグレーション → データベース更新
```

### 2. 環境

**開発環境:**

- フロントエンド: Vite 開発サーバー（localhost:5173）
- バックエンド: Go（localhost:8080）+ Air（ホットリロード）
- データベース: PostgreSQL（Docker Compose）

**ステージング環境:**

- フロントエンド: Vercel / Netlify
- バックエンド: Fly.io / Railway
- データベース: PostgreSQL（Fly.io / Railway）

**本番環境:**

- フロントエンド: Vercel / Netlify（CDN 配信）
- バックエンド: Fly.io / AWS EC2（Go バイナリ）
- データベース: AWS RDS / Fly.io Postgres
- リバースプロキシ: Nginx（オプション）

### 3. バージョン管理

- セマンティックバージョニング（例: 1.0.0）
- データベースマイグレーション管理（Prisma Migrate）
- バージョンアップ時のマイグレーション処理
- ロールバック機能

### 4. アセット管理

- スプライトシートの最適化（圧縮）
- 遅延読み込みではなく、起動時に全リソースをプリロード
- CDN による配信
- ブラウザキャッシュの活用

### 5. 監視とログ

- **エラー監視**: Sentry
- **パフォーマンス監視**: New Relic / DataDog
- **ログ管理**: Winston（バックエンド）
- **アクセスログ**: Nginx / CloudFlare
