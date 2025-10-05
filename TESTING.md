# テスト戦略 - ワンアワー・ヒーロー

## 📊 テストの種類

### 1. E2Eテスト（Playwright）✅
完全な自動ブラウザテスト

**場所**: `e2e/tests/`

**セットアップ**:
```bash
cd e2e
npm install
npx playwright install
```

**実行方法**:
```bash
# プロジェクトルートから
make test-e2e        # ヘッドレスモードで実行
make test-e2e-ui     # UIモードで実行（ブラウザが見える）

# または e2e ディレクトリから
cd e2e
npm test             # 全テスト実行
npm run test:headed  # ブラウザを表示して実行
npm run test:debug   # デバッグモード
npm run test:ui      # インタラクティブUIモード
```

**テストケース**:
1. ✅ ログインページの表示確認
2. ✅ ログイン → メニュー → ゲーム開始フロー
3. ✅ プレイヤー移動とタイマー動作
4. ✅ 新規登録機能
5. ✅ ゲームHUD表示
6. ✅ 5つの時間モード選択

### 2. ユニットテスト（バックエンド）🚧
Goのテストフレームワーク

**場所**: `backend/internal/*/`

**実行方法**:
```bash
make test
# または
docker-compose -f docker-compose.dev.yml exec backend go test -v ./...
```

**TODO**: 各サービス層のユニットテスト追加

### 3. 手動テスト ✅
開発者による動作確認

**チェックリスト**:
- [ ] ログイン/ログアウト
- [ ] 新規登録
- [ ] 時間モード選択
- [ ] プレイヤー移動（WASD/矢印キー）
- [ ] タイマーカウントダウン
- [ ] ポーズ機能（ESC）
- [ ] ゲームオーバー表示
- [ ] メニューへの復帰

## 🎯 テストカバレッジ目標

### 現在のカバレッジ
- E2E: 主要フロー100%
- ユニット: 0%
- 統合: 0%

### 目標カバレッジ
- E2E: 主要フロー100% ✅
- ユニット: 80%
- 統合: 60%

## 🔍 テストシナリオ詳細

### E2Eテスト

#### シナリオ1: 新規ユーザー登録からゲームプレイまで
```typescript
1. トップページアクセス
2. 「アカウント作成」をクリック
3. ユーザー名・パスワード入力
4. 登録ボタンをクリック
5. メニュー画面に自動遷移
6. 時間モードを選択
7. ゲーム画面に遷移
8. プレイヤー移動を確認
9. タイマー動作を確認
```

#### シナリオ2: 既存ユーザーのログイン
```typescript
1. トップページアクセス
2. ユーザー名・パスワード入力
3. ログインボタンをクリック
4. メニュー画面に遷移
5. プロフィール情報表示を確認
```

#### シナリオ3: ゲーム機能テスト
```typescript
1. ログイン
2. 1分モードを選択
3. ゲーム開始
4. W/A/S/Dキーで移動
5. 移動が正常に動作することを確認
6. タイマーが減少することを確認
7. ESCキーでポーズ
8. ポーズメニューが表示されることを確認
9. 再開ボタンでゲーム再開
10. メニューに戻るボタンで離脱
```

## 🚀 テスト実行フロー

### ローカル開発時
```bash
# 1. サービスを起動
make dev

# 2. E2Eテストを実行
make test-e2e

# 3. レポート確認
cd e2e && npm run report
```

### CI/CD環境
```bash
# 1. Dockerイメージをビルド
docker-compose -f docker-compose.dev.yml build

# 2. サービスを起動
docker-compose -f docker-compose.dev.yml up -d

# 3. ヘルスチェック待機
curl --retry 10 --retry-delay 2 http://localhost:8080/health

# 4. E2Eテストを実行
cd e2e && npm test

# 5. クリーンアップ
docker-compose -f docker-compose.dev.yml down
```

## 📝 テスト結果の記録

### 成功時
- HTMLレポート: `e2e/playwright-report/`
- トレース: `e2e/test-results/`

### 失敗時
- スクリーンショット: 自動保存
- 動画: 自動保存
- トレース: デバッグ用に保存

### レポート確認
```bash
cd e2e
npm run report
```

## 🐛 テストデバッグ

### Playwrightデバッグ
```bash
cd e2e
npm run test:debug
```

### UIモードで確認
```bash
cd e2e
npm run test:ui
```

### 特定のテストのみ実行
```bash
cd e2e
npx playwright test game.spec.ts --grep "ログイン"
```

### ヘッドフルモードで実行
```bash
cd e2e
npm run test:headed
```

## 📊 継続的な改善

### 次に追加すべきテスト

#### E2E
- [ ] エラーハンドリング（ログイン失敗など）
- [ ] タイムアップ時の挙動
- [ ] 複数ブラウザでの動作確認
- [ ] モバイルデバイスのエミュレーション

#### ユニット
- [ ] 認証サービステスト
- [ ] スコア計算テスト
- [ ] プレイヤーシステムテスト
- [ ] タイマーシステムテスト

#### 統合
- [ ] APIエンドポイントテスト
- [ ] データベース操作テスト

## 🎯 品質基準

### リリース条件
- ✅ 全E2Eテストが成功
- ✅ ユニットテストカバレッジ80%以上
- ✅ 重大なバグがない
- ✅ パフォーマンステストをクリア

### パフォーマンス基準
- ページロード: < 3秒
- ゲームFPS: 60 FPS
- API応答時間: < 200ms

## 📚 参考資料

- [Playwright Documentation](https://playwright.dev/)
- [Go Testing](https://golang.org/pkg/testing/)
- [Testing Best Practices](https://testingjavascript.com/)
