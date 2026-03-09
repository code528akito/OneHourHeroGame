# 📑 ドキュメント索引

**プロジェクト**: ワンアワー・ヒーロー  
**最終更新**: 2025-10-05

---

## 📚 すべてのドキュメント一覧

### 📁 ルート

- [README.md](README.md) - ドキュメントトップページ
- [INDEX.md](INDEX.md) - このファイル（ドキュメント索引）

---

### 🏗️ architecture/ - アーキテクチャ設計

1. [system-overview.md](architecture/system-overview.md)
   - システム全体像
   - 高レベルアーキテクチャ
   - 技術スタック
   - データフロー

2. [backend-architecture.md](architecture/backend-architecture.md)
   - バックエンド設計
   - APIエンドポイント
   - 認証システム
   - データベース層

3. [frontend-architecture.md](architecture/frontend-architecture.md)
   - フロントエンド設計
   - ゲームエンジン
   - 状態管理（Zustand）
   - Canvasレンダリング

4. [database-schema.md](architecture/database-schema.md)
   - データベース設計
   - ER図
   - テーブル定義
   - インデックス戦略

---

### 🎮 features/ - 機能仕様

1. [game-mechanics.md](features/game-mechanics.md)
   - ゲームメカニクス
   - タイムモードシステム
   - ゲームループ
   - 戦闘システム

2. [class-system.md](features/class-system.md)
   - クラスシステム
   - 騎士・魔法使い・盗賊・弓使い
   - スキル詳細
   - クラス比較

3. [monster-system.md](features/monster-system.md)
   - モンスターシステム
   - 11種類のモンスター
   - AIシステム
   - モンスター配置

4. [map-system.md](features/map-system.md)
   - マップシステム
   - 5つのエリア
   - タイルシステム
   - カメラシステム

5. [skill-system.md](features/skill-system.md)
   - スキルシステム
   - 8種類のスキル
   - クールダウン管理
   - スキル効果

6. [item-system.md](features/item-system.md)
   - アイテムシステム
   - 装備アイテム
   - 消費アイテム
   - 自動収集システム

7. [effect-system.md](features/effect-system.md)
   - エフェクトシステム
   - 7種類のエフェクト
   - エフェクト描画
   - パフォーマンス最適化

8. [achievement-system.md](features/achievement-system.md)
   - 実績システム
   - 6種類の実績
   - 解放条件
   - アニメーション

---

### 📖 guides/ - ガイド

1. [getting-started.md](guides/getting-started.md)
   - 始め方
   - クイックスタート
   - トラブルシューティング
   - 初心者向けヒント

2. [development-guide.md](guides/development-guide.md)
   - 開発ガイド
   - 開発環境構築
   - コーディング規約
   - デバッグ方法

3. [game-guide.md](guides/game-guide.md)
   - ゲームガイド
   - 操作方法
   - 攻略のコツ
   - クラス別戦略

4. [deployment-guide.md](guides/deployment-guide.md)
   - デプロイガイド
   - 本番環境構築
   - デプロイ手順
   - 運用ガイド

---

### 🔌 api/ - API仕様

1. [rest-api.md](api/rest-api.md)
   - REST API仕様
   - エンドポイント一覧
   - リクエスト/レスポンス形式
   - エラーハンドリング

2. [api-examples.md](api/api-examples.md)
   - APIサンプル
   - cURLコマンド例
   - JavaScriptサンプル
   - 実装例

---

### 📊 reports/ - レポート

1. [project-summary.md](reports/project-summary.md)
   - プロジェクトサマリー
   - 完成報告
   - 統計情報
   - 技術的成果

2. [task-completion.md](reports/task-completion.md)
   - タスク完了報告
   - 全41タスクの詳細
   - カテゴリ別進捗
   - 実装内容

3. [development-timeline.md](reports/development-timeline.md)
   - 開発タイムライン
   - フェーズ別進捗
   - セッション記録
   - 実装履歴

---

## 🗂️ カテゴリ別索引

### 初めての方向け

```
1. ドキュメントトップ
   → docs/README.md

2. システム全体像を理解
   → docs/architecture/system-overview.md

3. ゲームを始める
   → docs/guides/getting-started.md

4. ゲームの遊び方
   → docs/guides/game-guide.md
```

### 開発者向け

```
1. 開発環境構築
   → docs/guides/development-guide.md

2. バックエンド設計
   → docs/architecture/backend-architecture.md

3. フロントエンド設計
   → docs/architecture/frontend-architecture.md

4. API仕様
   → docs/api/rest-api.md
```

### ゲームデザイナー向け

```
1. ゲームメカニクス
   → docs/features/game-mechanics.md

2. クラスシステム
   → docs/features/class-system.md

3. モンスターシステム
   → docs/features/monster-system.md

4. マップシステム
   → docs/features/map-system.md
```

### プロジェクト管理者向け

```
1. プロジェクトサマリー
   → docs/reports/project-summary.md

2. タスク完了報告
   → docs/reports/task-completion.md

3. 開発タイムライン
   → docs/reports/development-timeline.md
```

---

## 📝 ドキュメント統計

### 総ドキュメント数

```
アーキテクチャ: 4ファイル
機能仕様:       8ファイル
ガイド:         4ファイル
API:           2ファイル
レポート:       3ファイル
その他:         2ファイル
━━━━━━━━━━━━━━━━━━━━
合計:          23ファイル
```

### 総文字数（推定）

```
アーキテクチャ: 約30,000文字
機能仕様:       約50,000文字
ガイド:         約20,000文字
API:           約15,000文字
レポート:       約15,000文字
━━━━━━━━━━━━━━━━━━━━
合計:          約130,000文字
```

---

## 🔍 クイック検索

### キーワードで探す

| キーワード | ドキュメント |
|-----------|-------------|
| Docker | getting-started.md, development-guide.md |
| JWT | backend-architecture.md, rest-api.md |
| クラス | class-system.md, game-mechanics.md |
| スキル | skill-system.md, class-system.md |
| モンスター | monster-system.md, map-system.md |
| エフェクト | effect-system.md, frontend-architecture.md |
| API | rest-api.md, api-examples.md, backend-architecture.md |
| タスク | task-completion.md, development-timeline.md |

---

## 📅 更新履歴

### 2025-10-05
- 初版作成
- 全23ファイル作成
- MVP版完成に伴い体系的に整備

---

## 🔗 外部リンク

### プロジェクト

- [メインREADME](../README.md)
- [タスク進捗](../TASK_PROGRESS.md)
- [GitHub Repository](#)

### 開発リソース

- [Go Documentation](https://golang.org/doc/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**作成日**: 2025-10-05  
**バージョン**: 1.0  
**管理者**: プロジェクトチーム
