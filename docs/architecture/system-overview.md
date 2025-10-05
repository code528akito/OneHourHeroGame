# 🏗️ システム全体像

**ドキュメント**: アーキテクチャ / システム全体像  
**最終更新**: 2025-10-05

---

## 📊 システム概要

ワンアワー・ヒーローは、制限時間内にプレイするローグライクRPGです。
Full-stackアプリケーションとして、バックエンド（Go）、フロントエンド（React）、データベース（PostgreSQL）で構成されています。

---

## 🎯 システムアーキテクチャ

### 高レベルアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │          React Frontend (Port 5173)               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │   UI/UX     │  │ Game Engine │  │  State   │  │  │
│  │  │ Components  │  │   Systems   │  │  Store   │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
                       │ (JSON)
┌──────────────────────┴──────────────────────────────────┐
│              Go Backend (Port 8080)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  API Server                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │  │  Router  │  │Middleware│  │    Handlers    │  │  │
│  │  │  (Gin)   │  │  (JWT)   │  │ (Controllers)  │  │  │
│  │  └──────────┘  └──────────┘  └────────────────┘  │  │
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │         Business Logic Layer              │   │  │
│  │  │  (Services, Game Logic, Validation)       │   │  │
│  │  └───────────────────────────────────────────┘   │  │
│  │  ┌───────────────────────────────────────────┐   │  │
│  │  │         Data Access Layer                 │   │  │
│  │  │  (Repository Pattern, GORM)               │   │  │
│  │  └───────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL
                       │
┌──────────────────────┴──────────────────────────────────┐
│         PostgreSQL Database (Port 5432)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Tables: users, profiles, scores, achievements    │  │
│  │  Indexes, Constraints, Relationships              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 技術スタック

### バックエンド
```yaml
言語: Go 1.22
フレームワーク: Gin Web Framework
ORM: GORM
認証: JWT (golang-jwt)
パスワード: bcrypt
データベース: PostgreSQL 15
```

### フロントエンド
```yaml
言語: TypeScript 5.x
フレームワーク: React 18
ビルドツール: Vite 5.x
状態管理: Zustand
ルーティング: React Router v6
スタイリング: Tailwind CSS 3.x
HTTP: Axios
```

### インフラ
```yaml
コンテナ: Docker & Docker Compose
開発環境: ホットリロード対応
データベース: PostgreSQL in Docker
```

---

## 📦 コンポーネント構成

### 1. フロントエンド層

#### 1.1 UIコンポーネント
- **認証**: LoginPage, RegisterPage
- **メニュー**: MainMenuPage, ClassSelectionPage
- **ゲーム**: GamePage, GameCanvas, GameHUD
- **リザルト**: ResultScreen
- **共通**: LeaderboardView, AchievementsView, SettingsView

#### 1.2 ゲームシステム
- **GameEngine**: ゲームループ、更新、描画
- **GameStateManager**: 状態管理
- **TimerSystem**: タイマー管理
- **MapSystem**: マップ生成、レンダリング
- **EffectSystem**: エフェクト管理
- **ScoreSystem**: スコア計算

#### 1.3 ゲームモデル
- **Player**: プレイヤー管理
- **Monster**: モンスター管理
- **NPC**: NPC会話システム
- **Item**: アイテムシステム
- **Skill**: スキルシステム

### 2. バックエンド層

#### 2.1 APIエンドポイント
- **認証**: /api/auth/*
- **プレイヤー**: /api/player/*
- **スコア**: /api/scores/*
- **実績**: /api/achievements/*

#### 2.2 ミドルウェア
- **CORS**: クロスオリジン設定
- **JWT認証**: トークン検証
- **ロギング**: リクエストログ
- **リカバリ**: パニック復旧

#### 2.3 データモデル
- **User**: ユーザー情報
- **Profile**: プレイヤープロフィール
- **Score**: スコア記録
- **Achievement**: 実績管理

### 3. データベース層

#### 3.1 テーブル構成
```sql
users (id, username, password_hash, created_at)
  ├── profiles (user_id, display_name, total_play_time)
  ├── scores (user_id, time_mode, score, rank, ...)
  └── user_achievements (user_id, achievement_id, unlocked_at)
  
achievements (id, name, description, icon)
settings (user_id, bgm_volume, se_volume, ...)
```

---

## 🔄 データフロー

### ゲームプレイフロー

```
1. ユーザー認証
   Browser → POST /api/auth/login → Backend → DB
   ← JWT Token ←

2. ゲーム開始
   Browser → GET /api/player/profile → Backend → DB
   ← Player Data ←

3. ゲームプレイ
   [クライアント側でゲームロジック実行]
   - 60FPS ゲームループ
   - リアルタイム更新
   - ローカル状態管理

4. ゲーム終了
   Browser → POST /api/scores → Backend → DB
   ← Score Saved ←

5. 実績解放
   Browser → POST /api/achievements/unlock → Backend → DB
   ← Achievement Unlocked ←
```

### 認証フロー

```
1. ユーザー登録
   User Input → POST /api/auth/register
   → bcrypt Hash → DB Insert
   → JWT Generate → Return Token

2. ログイン
   User Input → POST /api/auth/login
   → bcrypt Verify → JWT Generate
   → Return Token

3. 認証済みリクエスト
   Request + JWT → Middleware Verify
   → Extract User ID → Handler
   → Access DB → Return Data
```

---

## 🎮 ゲームアーキテクチャ

### ゲームループ

```typescript
function gameLoop(currentTime) {
  deltaTime = currentTime - lastFrameTime
  
  // 1. 入力処理
  handleInput()
  
  // 2. 更新
  updatePlayer(deltaTime)
  updateMonsters(deltaTime)
  updateEffects(deltaTime)
  checkCollisions()
  
  // 3. 描画
  clearCanvas()
  renderMap()
  renderItems()
  renderMonsters()
  renderPlayer()
  renderEffects()
  renderHUD()
  
  // 4. 次フレーム
  requestAnimationFrame(gameLoop)
}
```

### 状態管理

```
Zustand Store
├── user: User | null
├── token: string | null
├── gameState: GameState
├── timeMode: TimeMode
├── classType: string
└── actions
    ├── login()
    ├── logout()
    ├── startGame()
    └── endGame()
```

---

## 🔒 セキュリティ

### 認証・認可
- **JWT**: トークンベース認証
- **bcrypt**: パスワードハッシュ化（コスト10）
- **HTTPS**: 本番環境では必須（推奨）

### データ保護
- **SQL Injection**: GORM ORMで自動防御
- **XSS**: React の自動エスケープ
- **CSRF**: SameSite Cookie（将来実装）

### APIセキュリティ
- **CORS**: 許可されたオリジンのみ
- **Rate Limiting**: 今後実装予定
- **Input Validation**: すべての入力を検証

---

## 📊 パフォーマンス

### フロントエンド
- **60 FPS**: ゲームループ維持
- **Canvas Rendering**: 効率的な描画
- **Camera Culling**: 画面外は描画しない
- **Effect Management**: 不要なエフェクトは削除

### バックエンド
- **API Response**: < 100ms
- **DB Query**: インデックス使用
- **Connection Pool**: GORM デフォルト設定

### データベース
- **Indexes**: 主要カラムにインデックス
- **Foreign Keys**: 参照整合性
- **Migrations**: GORM AutoMigrate

---

## 🚀 スケーラビリティ

### 現在の制限
- **同時接続**: 中規模（100-1000ユーザー）
- **データベース**: 単一インスタンス
- **セッション**: ステートレス（JWT）

### 将来の拡張
- **ロードバランサ**: 複数バックエンドインスタンス
- **データベース**: レプリケーション、シャーディング
- **キャッシュ**: Redis導入
- **CDN**: 静的ファイル配信

---

## 📦 デプロイメント

### 開発環境
```bash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
# Database: localhost:5432
```

### 本番環境（推奨）
```
Frontend: Vercel / Netlify
Backend: Fly.io / Railway / Heroku
Database: Supabase / Railway / Heroku Postgres
```

---

## 🔗 関連ドキュメント

- [バックエンド設計](backend-architecture.md)
- [フロントエンド設計](frontend-architecture.md)
- [データベース設計](database-schema.md)
- [REST API仕様](../api/rest-api.md)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0
