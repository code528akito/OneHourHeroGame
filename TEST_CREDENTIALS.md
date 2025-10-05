# テストアカウント情報

## 利用可能なテストアカウント

### テストユーザー1
```
Username: testuser2
Password: password123
```

### テストユーザー2
```
Username: testuser3
Password: password123
```

## 新規登録も可能

お好きなユーザー名で新規登録できます：
- ユーザー名: 3-50文字
- パスワード: 6文字以上

## アクセス方法

1. ブラウザで開く
```
http://localhost:5173
```

2. ログイン画面で上記のユーザー名とパスワードを入力

3. または新規登録を選択して新しいアカウントを作成

## トラブルシューティング

### ログインできない場合

1. サービスが起動しているか確認
```bash
cd /home/akito/test2
docker-compose -f docker-compose.dev.yml ps
```

2. ログを確認
```bash
make dev-logs
```

3. サービスを再起動
```bash
make dev-down
make dev
```

### ブラウザのキャッシュをクリア

1. ブラウザの開発者ツールを開く（F12）
2. Application/Storageタブ
3. Local Storageをクリア
4. ページをリロード（Ctrl+Shift+R）
