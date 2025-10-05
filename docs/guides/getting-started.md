# 🚀 始め方ガイド

**ドキュメント**: ガイド / 始め方  
**最終更新**: 2025-10-05

---

## 📋 必要な環境

### ソフトウェア要件

```yaml
必須:
  - Docker: 20.10以上
  - Docker Compose: 2.0以上
  
推奨（開発時）:
  - Node.js: 18.x以上
  - Go: 1.22以上
  - PostgreSQL: 15以上
```

### ハードウェア要件

```yaml
最小:
  - CPU: 2コア
  - RAM: 4GB
  - ストレージ: 5GB

推奨:
  - CPU: 4コア以上
  - RAM: 8GB以上
  - ストレージ: 10GB以上
```

---

## 🏁 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-repo/one-hour-hero.git
cd one-hour-hero
```

### 2. 環境変数の設定（オプション）

```bash
# .env.example をコピー
cp .env.example .env

# 必要に応じて編集
nano .env
```

### 3. Docker Compose で起動

```bash
docker-compose up -d
```

### 4. アクセス

```
フロントエンド: http://localhost:5173
バックエンドAPI: http://localhost:8080
データベース: localhost:5432
```

### 5. テストユーザーでログイン

```
ユーザー名: testuser2
パスワード: password123
```

---

## 🎮 ゲームの始め方

### 1. アカウント作成

1. http://localhost:5173 にアクセス
2. 「新規登録」をクリック
3. ユーザー名とパスワードを入力
4. 「登録」をクリック

### 2. 時間モード選択

メインメニューで5つの時間モードから選択：

```
1分モード   - チャレンジ
5分モード   - スピードラン
10分モード  - 標準プレイ ← おすすめ
30分モード  - じっくり探索
60分モード  - 完全攻略
```

### 3. クラス選択

3つのクラスから選択：

```
騎士      - 初心者向け、バランス型
魔法使い  - 高火力、範囲攻撃
盗賊      - 高速移動、クリティカル
```

### 4. ゲームプレイ

```
移動: WASD または 矢印キー
スキル: Q, E
アイテム: 1, 2, 3
ポーズ: ESC
```

### 5. ゲーム終了

- タイマーが0になる
- または魔王を倒す

### 6. 結果確認

- スコアとランク（S/A/B/C）
- 実績解放
- リーダーボード

---

## 🔧 トラブルシューティング

### ポートが既に使用されている

```bash
# ポート使用状況の確認
lsof -i :5173  # フロントエンド
lsof -i :8080  # バックエンド
lsof -i :5432  # データベース

# プロセスを終了
kill -9 <PID>

# または docker-compose.yml のポートを変更
ports:
  - "5174:5173"  # 変更例
```

### Docker コンテナが起動しない

```bash
# ログの確認
docker-compose logs

# 特定のサービスのログ
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database

# コンテナの再起動
docker-compose restart

# 完全に再構築
docker-compose down
docker-compose up --build
```

### データベース接続エラー

```bash
# データベースの状態確認
docker-compose ps

# データベースログの確認
docker-compose logs database

# データベースに接続してテスト
docker-compose exec database psql -U hero -d hero_db
```

### フロントエンドが表示されない

```bash
# フロントエンドログの確認
docker-compose logs frontend

# ブラウザのキャッシュをクリア
Ctrl + Shift + R (Chrome/Firefox)

# Node modulesの再インストール
docker-compose exec frontend npm install
```

---

## 📚 次のステップ

### ゲームを楽しむ

1. [ゲームガイド](game-guide.md) - 詳しい遊び方
2. [クラスシステム](../features/class-system.md) - クラスの特徴
3. [マップシステム](../features/map-system.md) - エリア情報

### 開発に参加する

1. [開発ガイド](development-guide.md) - 開発環境構築
2. [バックエンド設計](../architecture/backend-architecture.md) - バックエンドの理解
3. [フロントエンド設計](../architecture/frontend-architecture.md) - フロントエンドの理解

---

## 💡 ヒント

### 初心者向け

```
1. 最初は10分モード × 騎士がおすすめ
2. スタートの町でNPCと会話
3. スライムで経験値を稼ぐ（レベル3目標）
4. 回復ポーションを忘れずに収集
5. 古のトレント（ミニボス）を倒すのが最初の目標
```

### 効率的なプレイ

```
1. エリアを順番に攻略（町→平原→森→洞窟→火山・城）
2. レベルアップ時にHPが全回復
3. 装備は必ず拾う（炎の剣、氷の盾）
4. スキルのクールダウンを意識
5. タイマーを常に確認
```

---

## 🔗 関連リンク

- [ゲームガイド](game-guide.md)
- [開発ガイド](development-guide.md)
- [システム全体像](../architecture/system-overview.md)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0
