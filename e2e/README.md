# E2Eテスト - ワンアワー・ヒーロー

## セットアップ

```bash
cd e2e
npm install
npx playwright install
```

## テスト実行

### 基本的な実行
```bash
npm test
```

### ヘッドレスモードで実行（ブラウザが見える）
```bash
npm run test:headed
```

### デバッグモード
```bash
npm run test:debug
```

### UIモード（インタラクティブ）
```bash
npm run test:ui
```

### レポート表示
```bash
npm run report
```

## Makefileから実行

```bash
# プロジェクトルートから
make test-e2e       # テスト実行
make test-e2e-ui    # UIモードで実行
```

## テスト内容

### 1. ログインページテスト
- ログインページの表示確認
- 入力フォームの確認

### 2. ログインフローテスト
- ログイン → メニュー → ゲーム開始
- 全画面遷移の確認

### 3. ゲーム機能テスト
- プレイヤー移動（WASD）
- タイマー動作確認
- ポーズ機能

### 4. 新規登録テスト
- 新規アカウント作成
- 登録後の自動ログイン

### 5. HUD表示テスト
- レベル表示
- HP/経験値バー

### 6. 時間モードテスト
- 5つの時間モード選択

## 前提条件

テスト実行前に開発サーバーを起動しておく必要があります：

```bash
cd /home/akito/test2
make dev
```

## スクリーンショット・動画

テスト失敗時には自動的に以下が保存されます：
- スクリーンショット: `test-results/`
- 動画: `test-results/`
- トレース: `test-results/`

## CI/CD統合

GitHub Actionsなどで実行する場合：

```yaml
- name: Install dependencies
  run: |
    cd e2e
    npm install
    npx playwright install --with-deps

- name: Run E2E tests
  run: |
    cd e2e
    npm test
```
