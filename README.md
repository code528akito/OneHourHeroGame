# ワンアワー・ヒーロー (One Hour Hero)

世界の滅亡まで残り60分という状況で魔王を倒すことを目指す、リアルタイム制のアクションRPGです。

## 概要

プレイヤーは止まらない時間と戦いながら、効率的なルート選択、情報収集、戦闘を行い、限られた時間内でクリアを目指します。繰り返しプレイすることで最適なルートや戦略を学習し、スコアを競い合うことができます。

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite
- Zustand (状態管理)
- Tailwind CSS
- HTML5 Canvas

### バックエンド
- Go (Golang)
- Gin (HTTPフレームワーク)
- GORM (ORM)
- PostgreSQL
- JWT認証

## プロジェクト構造

```
.
├── frontend/          # Reactフロントエンド
│   ├── src/
│   │   ├── components/   # Reactコンポーネント
│   │   ├── systems/      # ゲームシステム
│   │   ├── models/       # データモデル
│   │   ├── api/          # APIクライアント
│   │   ├── stores/       # Zustand状態管理
│   │   └── assets/       # 画像・音声リソース
│   └── public/
├── backend/           # Goバックエンド
│   ├── cmd/server/       # エントリーポイント
│   └── internal/
│       ├── api/          # HTTPハンドラー
│       ├── service/      # ビジネスロジック
│       ├── repository/   # データアクセス
│       ├── middleware/   # ミドルウェア
│       └── models/       # データモデル
├── database/          # データベーススクリプト
└── docker-compose.yml
```

## セットアップ

### 必要要件

- Docker & Docker Compose
- Make (オプション、直接docker-composeコマンドでも可)

### クイックスタート

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd one-hour-hero
```

2. Docker Composeで全てのサービスを起動:
```bash
make dev
# または
docker-compose -f docker-compose.dev.yml up --build
```

3. サービスにアクセス:
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8080
- PostgreSQL: localhost:5432

初回起動時は自動的にデータベースが初期化され、実績データがシードされます。

## 開発コマンド

```bash
make help                  # 利用可能なコマンド一覧を表示
make dev                   # 全サービスをビルドして起動
make dev-up                # 全サービスを起動
make dev-down              # 全サービスを停止
make dev-logs              # 全サービスのログを表示
make dev-logs-backend      # バックエンドのログのみ表示
make dev-logs-frontend     # フロントエンドのログのみ表示
make dev-restart           # 全サービスを再起動
make build                 # プロダクションビルド
make test                  # テストを実行
make lint                  # Linterを実行
make lint-fix              # Lintエラーを自動修正
make clean                 # コンテナとボリュームを削除
make shell-backend         # バックエンドコンテナに入る
make shell-frontend        # フロントエンドコンテナに入る
make shell-db              # PostgreSQLシェルに入る
```

## 開発環境の特徴

- **ホットリロード**: フロントエンドとバックエンドの両方でコード変更が自動的に反映されます
- **独立したコンテナ**: 各サービスが独立したDockerコンテナで動作
- **自動データベース初期化**: 初回起動時にスキーマとシードデータが自動的にセットアップされます
- **ボリュームマウント**: ローカルのコード変更がリアルタイムでコンテナに反映されます

## ゲーム仕様

### 時間モード

- 1分モード: 村の周りでスライムを倒す
- 5分モード: 森の奥の「炎の剣」を手に入れる
- 10分モード: 森のミニボス「古のトレント」を倒す
- 30分モード: 魔王城の門番を倒す
- 60分モード: 魔王を倒す

### クラス

- **騎士**: バランス型の初期クラス
- **魔法使い**: 高火力、低防御 (クリア後解放)
- **盗賊**: 高速、低防御 (クリア後解放)

### スコアリング

- 残り時間
- 到達レベル
- 達成イベント
- ランク (S, A, B, C)

## 📚 ドキュメント

詳細なドキュメントは `docs/` フォルダにあります：

### クイックリンク

- **[ドキュメントトップ](docs/README.md)** - ドキュメント目次
- **[始め方ガイド](docs/guides/getting-started.md)** - 環境構築と起動方法
- **[ゲームガイド](docs/guides/game-guide.md)** - ゲームの遊び方（作成予定）
- **[開発ガイド](docs/guides/development-guide.md)** - 開発環境のセットアップ（作成予定）

### アーキテクチャ

- [システム全体像](docs/architecture/system-overview.md) - プロジェクトの全体構成
- [バックエンド設計](docs/architecture/backend-architecture.md) - Go APIサーバーの設計
- [フロントエンド設計](docs/architecture/frontend-architecture.md) - Reactアプリの設計
- [データベース設計](docs/architecture/database-schema.md) - PostgreSQLスキーマ

### 機能仕様

- [ゲームメカニクス](docs/features/game-mechanics.md) - ゲームの基本システム
- [クラスシステム](docs/features/class-system.md) - 3つのプレイアブルクラス
- [モンスターシステム](docs/features/monster-system.md) - モンスターとAI（作成予定）
- [マップシステム](docs/features/map-system.md) - 5つのエリア（作成予定）

### プロジェクトレポート

- [プロジェクトサマリー](docs/reports/project-summary.md) - MVP版完成報告
- [タスク完了報告](docs/reports/task-completion.md) - 全タスクの詳細（作成予定）
- [開発タイムライン](docs/reports/development-timeline.md) - 開発の経緯（作成予定）

**全ドキュメント一覧**: [INDEX.md](docs/INDEX.md)

## ライセンス

MIT License

## 作者

Akito
