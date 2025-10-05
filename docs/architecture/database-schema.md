# 🗄️ データベース設計

**ドキュメント**: アーキテクチャ / データベース  
**最終更新**: 2025-10-05

---

## 📊 概要

PostgreSQL 15を使用。GORM ORMでマイグレーション管理。
ユーザー、プロフィール、スコア、実績の管理を実装。

---

## 🏗️ ER図

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◄──┐
│ username (U) │   │
│ password     │   │
│ created_at   │   │
└──────────────┘   │
                   │
        ┌──────────┴──────────┬─────────────┬──────────────┐
        │                     │             │              │
┌───────┴────────┐   ┌────────┴──────┐  ┌──┴────────────┐ ┌┴───────────────┐
│   profiles     │   │    scores     │  │   settings    │ │user_achievements│
│────────────────│   │───────────────│  │───────────────│ │─────────────────│
│ user_id (PK,FK)│   │ id (PK)       │  │ user_id(PK,FK)│ │ id (PK)         │
│ display_name   │   │ user_id (FK)  │  │ bgm_volume    │ │ user_id (FK)    │
│ total_play_time│   │ time_mode     │  │ se_volume     │ │ achievement_id  │
│ created_at     │   │ score         │  │ created_at    │ │ unlocked_at     │
└────────────────┘   │ rank          │  └───────────────┘ └─────────────────┘
                     │ remaining_time│                             │
                     │ player_level  │                             │
                     │ items_collected│                            │
                     │ monsters_defeat│                            │
                     │ cleared       │                             │
                     │ created_at    │                             │
                     └───────────────┘                             │
                                                                   │
                     ┌──────────────────┐                         │
                     │  achievements    │◄────────────────────────┘
                     │──────────────────│
                     │ id (PK)          │
                     │ name             │
                     │ description      │
                     │ icon             │
                     │ created_at       │
                     └──────────────────┘
```

---

## 📋 テーブル定義

### users テーブル

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

#### カラム詳細

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PRIMARY KEY | ユーザーID |
| username | VARCHAR(255) | UNIQUE, NOT NULL | ユーザー名（3-20文字） |
| password | VARCHAR(255) | NOT NULL | bcryptハッシュ化パスワード |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |

#### Go構造体

```go
type User struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    Username  string    `gorm:"uniqueIndex;not null" json:"username"`
    Password  string    `gorm:"not null" json:"-"`
    CreatedAt time.Time `json:"created_at"`
}
```

---

### profiles テーブル

```sql
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255) DEFAULT 'Hero',
    total_play_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### カラム詳細

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| user_id | UUID | PRIMARY KEY, FK | ユーザーID（外部キー） |
| display_name | VARCHAR(255) | DEFAULT 'Hero' | 表示名 |
| total_play_time | INTEGER | DEFAULT 0 | 総プレイ時間（秒） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### Go構造体

```go
type Profile struct {
    UserID        string    `gorm:"primaryKey" json:"user_id"`
    DisplayName   string    `json:"display_name"`
    TotalPlayTime int       `json:"total_play_time"`
    CreatedAt     time.Time `json:"created_at"`
    User          User      `gorm:"foreignKey:UserID" json:"-"`
}
```

---

### scores テーブル

```sql
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_mode VARCHAR(10) NOT NULL,
    score INTEGER NOT NULL,
    rank VARCHAR(1) NOT NULL,
    remaining_time INTEGER NOT NULL,
    player_level INTEGER NOT NULL,
    items_collected INTEGER DEFAULT 0,
    monsters_defeated INTEGER DEFAULT 0,
    cleared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_time_mode ON scores(time_mode);
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
```

#### カラム詳細

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PRIMARY KEY | スコアID |
| user_id | UUID | FK, NOT NULL | ユーザーID（外部キー） |
| time_mode | VARCHAR(10) | NOT NULL | タイムモード（60, 300, 600, 1800, 3600） |
| score | INTEGER | NOT NULL | スコア |
| rank | VARCHAR(1) | NOT NULL | ランク（S, A, B, C） |
| remaining_time | INTEGER | NOT NULL | 残り時間（秒） |
| player_level | INTEGER | NOT NULL | 最終レベル |
| items_collected | INTEGER | DEFAULT 0 | 収集アイテム数 |
| monsters_defeated | INTEGER | DEFAULT 0 | 倒したモンスター数 |
| cleared | BOOLEAN | DEFAULT FALSE | クリアフラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 記録日時 |

#### Go構造体

```go
type Score struct {
    ID               string    `gorm:"primaryKey" json:"id"`
    UserID           string    `gorm:"index;not null" json:"user_id"`
    TimeMode         string    `json:"time_mode"`
    Score            int       `json:"score"`
    Rank             string    `json:"rank"`
    RemainingTime    int       `json:"remaining_time"`
    PlayerLevel      int       `json:"player_level"`
    ItemsCollected   int       `json:"items_collected"`
    MonstersDefeated int       `json:"monsters_defeated"`
    Cleared          bool      `json:"cleared"`
    CreatedAt        time.Time `json:"created_at"`
    User             User      `gorm:"foreignKey:UserID" json:"-"`
}
```

---

### achievements テーブル

```sql
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### カラム詳細

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 実績ID（例: first_clear） |
| name | VARCHAR(255) | NOT NULL | 実績名 |
| description | TEXT | | 説明 |
| icon | VARCHAR(10) | | 絵文字アイコン |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### 初期データ

```sql
INSERT INTO achievements VALUES
('first_clear', '初回クリア', 'ゲームを初めてクリアした', '🎉', NOW()),
('speed_runner', 'スピードランナー', '5分以内にクリア', '⚡', NOW()),
('monster_hunter', 'モンスターハンター', '10体以上のモンスターを倒す', '⚔️', NOW()),
('level_master', 'レベルマスター', 'レベル10に到達', '⭐', NOW()),
('rank_s', 'Sランク獲得', 'Sランクを獲得', '🏆', NOW()),
('item_collector', 'アイテムコレクター', 'アイテムを5個以上収集', '🎁', NOW());
```

---

### user_achievements テーブル

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

#### カラム詳細

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PRIMARY KEY | レコードID |
| user_id | UUID | FK, NOT NULL | ユーザーID（外部キー） |
| achievement_id | VARCHAR(50) | FK, NOT NULL | 実績ID（外部キー） |
| unlocked_at | TIMESTAMP | DEFAULT NOW() | 解放日時 |

**制約**: (user_id, achievement_id) の組み合わせは一意

---

### settings テーブル

```sql
CREATE TABLE settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bgm_volume INTEGER DEFAULT 50,
    se_volume INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### カラム詳細

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| user_id | UUID | PRIMARY KEY, FK | ユーザーID（外部キー） |
| bgm_volume | INTEGER | DEFAULT 50 | BGM音量（0-100） |
| se_volume | INTEGER | DEFAULT 50 | 効果音音量（0-100） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

---

## 🔍 主要クエリ

### ユーザー認証

```sql
-- ユーザー登録
INSERT INTO users (id, username, password) 
VALUES (gen_random_uuid(), $1, $2)
RETURNING id, username, created_at;

-- ログイン
SELECT id, username, password 
FROM users 
WHERE username = $1;

-- プロフィール作成
INSERT INTO profiles (user_id, display_name) 
VALUES ($1, 'Hero');
```

### スコア管理

```sql
-- スコア保存
INSERT INTO scores (
    id, user_id, time_mode, score, rank, 
    remaining_time, player_level, items_collected, 
    monsters_defeated, cleared
) VALUES (
    gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;

-- 自分のスコア一覧
SELECT * FROM scores 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 10;

-- 最高スコア
SELECT * FROM scores 
WHERE user_id = $1 AND time_mode = $2
ORDER BY score DESC 
LIMIT 1;

-- リーダーボード
SELECT s.*, u.username 
FROM scores s
JOIN users u ON s.user_id = u.id
WHERE s.time_mode = $1
ORDER BY s.score DESC 
LIMIT 100;
```

### 実績管理

```sql
-- 実績解放
INSERT INTO user_achievements (id, user_id, achievement_id)
VALUES (gen_random_uuid(), $1, $2)
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- ユーザーの実績一覧
SELECT a.*, ua.unlocked_at
FROM achievements a
LEFT JOIN user_achievements ua 
    ON a.id = ua.achievement_id 
    AND ua.user_id = $1
ORDER BY a.created_at;
```

---

## 📊 インデックス戦略

### パフォーマンス最適化

```sql
-- ユーザー検索
CREATE INDEX idx_users_username ON users(username);

-- スコア検索
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_time_mode ON scores(time_mode);
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);

-- 実績検索
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- 複合インデックス（将来拡張用）
CREATE INDEX idx_scores_user_time ON scores(user_id, time_mode);
```

---

## 🔒 制約とルール

### 外部キー制約

```sql
-- カスケード削除
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_user 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 参照整合性
ALTER TABLE scores 
ADD CONSTRAINT fk_scores_user 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;
```

### チェック制約

```sql
-- 音量範囲
ALTER TABLE settings 
ADD CONSTRAINT check_bgm_volume 
CHECK (bgm_volume BETWEEN 0 AND 100);

ALTER TABLE settings 
ADD CONSTRAINT check_se_volume 
CHECK (se_volume BETWEEN 0 AND 100);

-- スコア範囲
ALTER TABLE scores 
ADD CONSTRAINT check_score 
CHECK (score >= 0);
```

---

## 🚀 マイグレーション

### GORM AutoMigrate

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

### 初期データ投入

```go
func SeedData(db *gorm.DB) error {
    // 実績データ
    achievements := []Achievement{
        {ID: "first_clear", Name: "初回クリア", ...},
        // ...
    }
    
    for _, achievement := range achievements {
        db.FirstOrCreate(&achievement, Achievement{ID: achievement.ID})
    }
    
    return nil
}
```

---

## 📈 データ統計

### 推定データ量

```
ユーザー数: 1,000人
平均プレイ回数: 10回/人
総スコア記録: 10,000件
実績数: 12種類
平均実績解放: 5個/人

推定データベースサイズ: < 100MB
```

---

## 🔗 関連ドキュメント

- [バックエンド設計](backend-architecture.md)
- [REST API仕様](../api/rest-api.md)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0
