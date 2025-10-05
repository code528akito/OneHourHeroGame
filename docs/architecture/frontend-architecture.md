# ⚛️ フロントエンドアーキテクチャ

**ドキュメント**: アーキテクチャ / フロントエンド  
**最終更新**: 2025-10-05

---

## 📊 概要

React 18 + TypeScript + Viteを使用したSPA。
Zustand状態管理、Canvas APIを使ったゲーム描画を実装。

---

## 🏗️ ディレクトリ構造

```
frontend/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── MainMenuPage.tsx
│   │   ├── ClassSelectionPage.tsx
│   │   ├── GamePage.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── GameHUD.tsx
│   │   ├── ItemBar.tsx
│   │   ├── SkillBar.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── DialogUI.tsx
│   │   ├── LeaderboardView.tsx
│   │   ├── AchievementsView.tsx
│   │   └── SettingsView.tsx
│   ├── systems/             # ゲームシステム
│   │   ├── GameEngine.ts
│   │   ├── GameStateManager.ts
│   │   ├── TimerSystem.ts
│   │   ├── MapSystem.ts
│   │   ├── SpriteSystem.ts
│   │   ├── ScoreSystem.ts
│   │   └── EffectSystem.ts
│   ├── models/              # ゲームモデル
│   │   ├── Player.ts
│   │   ├── Monster.ts
│   │   ├── NPC.ts
│   │   ├── Item.ts
│   │   └── Skill.ts
│   ├── stores/              # 状態管理
│   │   └── gameStore.ts
│   ├── api/                 # API クライアント
│   │   └── client.ts
│   ├── types/               # 型定義
│   │   └── index.ts
│   ├── App.tsx              # ルートコンポーネント
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── public/                  # 静的ファイル
├── index.html               # HTMLテンプレート
├── vite.config.ts           # Vite設定
├── tsconfig.json            # TypeScript設定
├── tailwind.config.js       # Tailwind設定
└── package.json             # npm設定
```

---

## 🔀 ルーティング

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/menu" element={<MainMenuPage />} />
    <Route path="/class-selection" element={<ClassSelectionPage />} />
    <Route path="/game" element={<GamePage />} />
    <Route path="/" element={<Navigate to="/menu" />} />
  </Routes>
</BrowserRouter>
```

---

## 🎮 ゲームエンジン

### GameEngine クラス

```typescript
class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private stateManager: GameStateManager
  private timerSystem: TimerSystem
  private effectSystem: EffectSystem
  private mapSystem: MapSystem
  private camera: Camera
  private player: Player
  private monsters: Monster[]
  
  constructor(canvas: HTMLCanvasElement)
  startGame(timeMode: TimeMode, classType: string)
  private gameLoop(currentTime: number)
  private update(deltaTime: number)
  private render()
  pauseGame()
  resumeGame()
  stopGame()
}
```

### ゲームループ

```typescript
private gameLoop = (currentTime: number): void => {
  const deltaTime = (currentTime - this.lastFrameTime) / 1000
  this.lastFrameTime = currentTime

  this.update(deltaTime)
  this.render()

  if (!this.stateManager.isGameOver()) {
    requestAnimationFrame(this.gameLoop)
  }
}
```

### 更新処理

```typescript
private update(deltaTime: number): void {
  // タイマー更新
  this.timerSystem.update(deltaTime)
  
  // エフェクト更新
  this.effectSystem.update(deltaTime)
  
  // プレイヤー更新
  this.player.update(deltaTime, isWalkable)
  
  // カメラ追従
  this.camera.follow(playerPos.x, playerPos.y)
  
  // モンスター更新
  this.monsters.forEach(monster => {
    monster.update(deltaTime, playerPos)
  })
  
  // 当たり判定
  this.checkCollisions()
  
  // アイテム収集
  this.checkItemCollection()
}
```

### 描画処理

```typescript
private render(): void {
  // 背景クリア
  this.ctx.fillStyle = '#1a1a2e'
  this.ctx.fillRect(0, 0, width, height)
  
  // マップ描画
  this.mapSystem.render(ctx, cameraX, cameraY)
  
  // ワールドアイテム描画
  this.renderWorldItems()
  
  // NPC描画
  this.renderNPCs()
  
  // モンスター描画
  this.monsters.forEach(m => m.render(ctx, cameraX, cameraY))
  
  // プレイヤー描画
  this.player.render(ctx, cameraX, cameraY)
  
  // エフェクト描画
  this.effectSystem.render(ctx, cameraX, cameraY)
  
  // HUD描画（別Canvas）
}
```

---

## 🎨 状態管理（Zustand）

```typescript
interface GameStore {
  // 状態
  user: User | null
  token: string | null
  gameState: GameState
  timeMode: TimeMode | null
  classType: string | null
  
  // アクション
  login: (username, password) => Promise<void>
  logout: () => void
  startGame: (mode: TimeMode) => void
  setClassType: (classType: string) => void
  endGame: (result: GameResult) => Promise<void>
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  // ...
}))
```

### 使用例

```typescript
function GamePage() {
  const { timeMode, classType } = useGameStore()
  
  useEffect(() => {
    if (!timeMode) {
      navigate('/menu')
      return
    }
    
    const gameEngine = new GameEngine(canvas)
    gameEngine.startGame(timeMode, classType)
  }, [timeMode, classType])
}
```

---

## 🎮 主要コンポーネント

### GamePage

```typescript
export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const { timeMode, classType } = useGameStore()
  
  const [timer, setTimer] = useState('00:00')
  const [playerStats, setPlayerStats] = useState({...})
  const [items, setItems] = useState([])
  const [skills, setSkills] = useState([])
  
  useEffect(() => {
    const gameEngine = new GameEngine(canvas)
    gameEngine.startGame(timeMode, classType)
    
    // 状態更新インターバル
    const interval = setInterval(() => {
      const player = gameEngine.getPlayer()
      setPlayerStats(player.getStats())
      setItems(player.getItemSystem().getAllItems())
      setSkills(player.getSkillSystem().getAllSkills())
    }, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div>
      <canvas ref={canvasRef} />
      <GameHUD stats={playerStats} />
      <ItemBar items={items} />
      <SkillBar skills={skills} />
      <TimerDisplay time={timer} />
    </div>
  )
}
```

### ClassSelectionPage

```typescript
export default function ClassSelectionPage() {
  const { setClassType, startGame, timeMode } = useGameStore()
  
  const handleClassSelect = (classId: string) => {
    setClassType(classId)
    startGame(timeMode)
    navigate('/game')
  }
  
  return (
    <div>
      {classes.map(classInfo => (
        <ClassCard
          key={classInfo.id}
          classInfo={classInfo}
          onSelect={handleClassSelect}
        />
      ))}
    </div>
  )
}
```

---

## 🖼️ Canvasレンダリング

### カメラシステム

```typescript
class Camera {
  private x: number = 0
  private y: number = 0
  
  follow(targetX: number, targetY: number): void {
    this.x = targetX - canvasWidth / 2
    this.y = targetY - canvasHeight / 2
    
    // ワールド境界内に制限
    this.x = Math.max(0, Math.min(this.x, worldWidth - canvasWidth))
    this.y = Math.max(0, Math.min(this.y, worldHeight - canvasHeight))
  }
  
  worldToScreen(worldX, worldY): Vector2 {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    }
  }
}
```

### カリング（描画最適化）

```typescript
render(ctx, cameraX, cameraY): void {
  const startX = Math.floor(cameraX / tileSize)
  const startY = Math.floor(cameraY / tileSize)
  const endX = Math.min(width, startX + visibleTilesX + 1)
  const endY = Math.min(height, startY + visibleTilesY + 1)
  
  // 画面内のタイルのみ描画
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      renderTile(x, y)
    }
  }
}
```

---

## 🔌 API クライアント

```typescript
class APIClient {
  private axios: AxiosInstance
  
  constructor() {
    this.axios = axios.create({
      baseURL: 'http://localhost:8080/api',
      timeout: 10000
    })
    
    // リクエストインターセプター
    this.axios.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }
  
  async login(username, password) {
    const { data } = await this.axios.post('/auth/login', {
      username, password
    })
    return data
  }
  
  async saveScore(scoreData) {
    const { data } = await this.axios.post('/scores', scoreData)
    return data
  }
}

export const apiClient = new APIClient()
```

---

## 🎨 スタイリング

### Tailwind CSS

```tsx
<div className="min-h-screen bg-gray-900 text-white">
  <div className="max-w-6xl mx-auto p-8">
    <h1 className="text-4xl font-bold mb-4">
      ワンアワー・ヒーロー
    </h1>
    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
      スタート
    </button>
  </div>
</div>
```

### カスタムCSS

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}
```

---

## 📦 ビルドとデプロイ

### 開発ビルド

```bash
npm run dev
# Vite dev server: http://localhost:5173
# Hot Module Replacement (HMR) 有効
```

### 本番ビルド

```bash
npm run build
# 出力: dist/
# 最適化、圧縮、Tree-shaking
```

### プレビュー

```bash
npm run preview
# ビルド結果のプレビュー
```

---

## 🧪 テスト

### Vitest

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('ログイン')).toBeInTheDocument()
  })
})
```

---

## 📊 パフォーマンス

### 最適化

- **Code Splitting**: React.lazy()
- **Memoization**: React.memo, useMemo
- **Virtual Scrolling**: 大量リスト表示
- **Canvas Optimization**: カリング、オブジェクトプーリング

### メトリクス

```
初回ロード: < 2秒
FPS: 60fps 安定
メモリ使用量: < 100MB
バンドルサイズ: < 500KB (gzip)
```

---

## 🔗 関連ドキュメント

- [ゲームメカニクス](../features/game-mechanics.md)
- [エフェクトシステム](../features/effect-system.md)
- [開発ガイド](../guides/development-guide.md)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0
