# 🔧 バックエンドアーキテクチャ

**ドキュメント**: アーキテクチャ / バックエンド  
**最終更新**: 2025-10-05

---

## 📊 概要

Go言語とGinフレームワークを使用したRESTful APIサーバー。
JWT認証、GORM ORMを使用したPostgreSQLとの連携を実装。

---

## 🏗️ ディレクトリ構造

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # エントリーポイント
├── internal/
│   ├── api/                     # APIハンドラー層
│   │   ├── auth_handler.go
│   │   ├── player_handler.go
│   │   ├── score_handler.go
│   │   └── achievement_handler.go
│   ├── database/                # データベース層
│   │   ├── database.go          # DB接続
│   │   ├── models.go            # データモデル
│   │   ├── migrations.go        # マイグレーション
│   │   └── seed.go              # 初期データ
│   ├── middleware/              # ミドルウェア
│   │   └── auth.go              # JWT認証
│   └── utils/                   # ユーティリティ
│       └── jwt.go               # JWTヘルパー
├── go.mod                       # Go モジュール
├── go.sum                       # 依存関係ロック
└── Dockerfile                   # Dockerイメージ
```

---

## 🔌 API エンドポイント

### 認証 API

#### POST /api/auth/register
```json
Request:
{
  "username": "testuser",
  "password": "password123"
}

Response (201):
{
  "user": {
    "id": "uuid",
    "username": "testuser"
  },
  "token": "jwt.token.here"
}
```

#### POST /api/auth/login
```json
Request:
{
  "username": "testuser",
  "password": "password123"
}

Response (200):
{
  "user": {
    "id": "uuid",
    "username": "testuser"
  },
  "token": "jwt.token.here"
}
```

#### GET /api/auth/me
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "id": "uuid",
  "username": "testuser"
}
```

### プレイヤー API

#### GET /api/player/profile
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "user_id": "uuid",
  "display_name": "Hero",
  "total_play_time": 3600,
  "created_at": "2025-10-05T00:00:00Z"
}
```

#### PUT /api/player/profile
```json
Headers: Authorization: Bearer <token>
Request:
{
  "display_name": "New Hero Name"
}

Response (200):
{
  "user_id": "uuid",
  "display_name": "New Hero Name",
  ...
}
```

#### GET /api/player/settings
#### PUT /api/player/settings

### スコア API

#### POST /api/scores
```json
Headers: Authorization: Bearer <token>
Request:
{
  "time_mode": "300",
  "score": 15000,
  "rank": "A",
  "remaining_time": 120,
  "player_level": 12,
  "items_collected": 5,
  "monsters_defeated": 30,
  "cleared": true
}

Response (201):
{
  "id": "uuid",
  "user_id": "uuid",
  "score": 15000,
  ...
}
```

#### GET /api/scores/my
```
Headers: Authorization: Bearer <token>
Query: ?limit=10

Response (200):
[
  {
    "id": "uuid",
    "score": 15000,
    "rank": "A",
    "created_at": "..."
  }
]
```

#### GET /api/scores/best
#### GET /api/scores/leaderboard

### 実績 API

#### GET /api/achievements
```
Response (200):
[
  {
    "id": "first_clear",
    "name": "初回クリア",
    "description": "ゲームを初めてクリア",
    "icon": "🎉"
  }
]
```

#### GET /api/achievements/my
#### POST /api/achievements/unlock

---

## 🔐 認証システム

### JWT トークン構造

```go
type Claims struct {
    UserID string `json:"user_id"`
    jwt.RegisteredClaims
}

// トークン有効期限: 24時間
expirationTime := time.Now().Add(24 * time.Hour)
```

### 認証フロー

```
1. ユーザー登録/ログイン
   ↓
2. パスワードハッシュ化（bcrypt）
   ↓
3. JWT トークン生成
   ↓
4. トークン返却
   ↓
5. クライアントが保存（localStorage）
   ↓
6. 以降のリクエストにトークン付与
   ↓
7. ミドルウェアでトークン検証
   ↓
8. ユーザーID抽出
   ↓
9. ハンドラーで処理
```

### パスワードハッシュ化

```go
// ハッシュ化
hashedPassword, _ := bcrypt.GenerateFromPassword(
    []byte(password), 
    bcrypt.DefaultCost // コスト10
)

// 検証
err := bcrypt.CompareHashAndPassword(
    hashedPassword, 
    []byte(password)
)
```

---

## 🗄️ データベース層

### GORM モデル

```go
type User struct {
    ID        string    `gorm:"primaryKey"`
    Username  string    `gorm:"uniqueIndex;not null"`
    Password  string    `gorm:"not null"`
    CreatedAt time.Time
}

type Profile struct {
    UserID        string `gorm:"primaryKey"`
    DisplayName   string
    TotalPlayTime int
    User          User `gorm:"foreignKey:UserID"`
}

type Score struct {
    ID               string `gorm:"primaryKey"`
    UserID           string `gorm:"index;not null"`
    TimeMode         string
    Score            int
    Rank             string
    RemainingTime    int
    PlayerLevel      int
    ItemsCollected   int
    MonstersDefeated int
    Cleared          bool
    CreatedAt        time.Time
    User             User `gorm:"foreignKey:UserID"`
}
```

### マイグレーション

```go
func AutoMigrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &User{},
        &Profile{},
        &Score{},
        &Achievement{},
        &UserAchievement{},
        &Settings{},
    )
}
```

### シードデータ

```go
func SeedAchievements(db *gorm.DB) {
    achievements := []Achievement{
        {
            ID: "first_clear",
            Name: "初回クリア",
            Description: "ゲームを初めてクリア",
            Icon: "🎉",
        },
        // ...
    }
    
    for _, achievement := range achievements {
        db.FirstOrCreate(&achievement, Achievement{ID: achievement.ID})
    }
}
```

---

## 🔧 ミドルウェア

### CORS ミドルウェア

```go
config := cors.DefaultConfig()
config.AllowOrigins = []string{"http://localhost:5173"}
config.AllowCredentials = true
config.AllowHeaders = []string{
    "Origin", "Content-Type", "Authorization",
}
router.Use(cors.New(config))
```

### JWT 認証ミドルウェア

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Authorizationヘッダーからトークン取得
        authHeader := c.GetHeader("Authorization")
        
        // "Bearer "プレフィックスを削除
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        
        // トークン検証
        claims, err := utils.ValidateToken(tokenString)
        
        // ユーザーIDをコンテキストにセット
        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

---

## 📦 依存関係

```go
require (
    github.com/gin-contrib/cors v1.7.2
    github.com/gin-gonic/gin v1.10.0
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/google/uuid v1.6.0
    golang.org/x/crypto v0.23.0
    gorm.io/driver/postgres v1.5.9
    gorm.io/gorm v1.25.12
)
```

---

## 🚀 起動フロー

```go
func main() {
    // 1. データベース接続
    db := database.Connect()
    
    // 2. マイグレーション実行
    database.AutoMigrate(db)
    
    // 3. シードデータ投入
    database.SeedData(db)
    
    // 4. ルーター設定
    router := setupRouter(db)
    
    // 5. サーバー起動
    router.Run(":8080")
}
```

---

## 🧪 テスト

### ユニットテスト例

```go
func TestAuthHandler_Register(t *testing.T) {
    // テストデータベース作成
    db := setupTestDB()
    defer db.Close()
    
    // ハンドラー作成
    handler := api.NewAuthHandler(db)
    
    // テストリクエスト
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = httptest.NewRequest("POST", "/", body)
    
    // ハンドラー実行
    handler.Register(c)
    
    // アサーション
    assert.Equal(t, 201, w.Code)
}
```

---

## 📊 パフォーマンス

### API レスポンスタイム
```
GET  /api/auth/me:              < 10ms
GET  /api/player/profile:       < 20ms
POST /api/scores:               < 50ms
GET  /api/scores/leaderboard:   < 100ms
```

### データベースクエリ
```sql
-- インデックス使用
SELECT * FROM scores 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 10;

-- 実行計画: Index Scan
```

---

## 🔗 関連ドキュメント

- [データベース設計](database-schema.md)
- [REST API仕様](../api/rest-api.md)
- [開発ガイド](../guides/development-guide.md)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0
