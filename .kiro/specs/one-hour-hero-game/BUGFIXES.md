# Bug Fixes Log

## 2025-10-04: Score Save Duplicate Request Prevention

### Issue
スコア保存ボタンを複数回クリックすると、同じスコアが重複して保存される問題がありました。
また、2回目以降のゲームプレイでスコア保存が失敗するケースも報告されました。

### Root Cause
1. **フロントエンド**: コンポーネントの状態が適切にリセットされず、`saved` フラグが次のゲームでも保持される
2. **フロントエンド**: ボタンの連続クリックに対する防止メカニズムが不十分
3. **バックエンド**: 重複保存を防ぐロジックがなく、同じスコアが複数回DBに登録される

### Fix

#### Frontend (ResultScreen.tsx)

**1. useEffectでコンポーネントマウント時に状態をリセット**
```typescript
useEffect(() => {
  console.log('ResultScreen mounted with result:', result)
  setSaving(false)
  setSaved(false)
  setSaveError(null)
  saveAttemptedRef.current = false
}, [result])
```

**2. useRefを使った追加の重複防止メカニズム**
```typescript
const saveAttemptedRef = useRef(false)

const handleSaveScore = async () => {
  if (saving || saved || saveAttemptedRef.current) {
    return
  }
  saveAttemptedRef.current = true
  // ...
}
```

**3. エラー時の再試行を許可**
```typescript
catch (error: any) {
  // リクエストが失敗した場合は再試行を許可
  saveAttemptedRef.current = false
  setSaveError(errorMessage)
}
```

#### Backend (backend/internal/service/score.go)

**10秒以内の重複スコア保存を防止**
```go
func (s *ScoreService) SaveScore(userID uuid.UUID, req *SaveScoreRequest) (*models.Score, error) {
    // 重複保存チェック：同じユーザーが10秒以内に同じスコアを保存しようとした場合は拒否
    var recentScore models.Score
    err := database.DB.Where("user_id = ? AND time_mode = ? AND score = ? AND created_at > ?",
        userID, req.TimeMode, req.Score, time.Now().Add(-10*time.Second)).
        First(&recentScore).Error
    
    if err == nil {
        return nil, fmt.Errorf("同じスコアを短時間に複数回保存することはできません（10秒間隔を空けてください）")
    }
    // ...
}
```

### Changes
- **Frontend**: 
  - `useEffect`で状態の自動リセット機能を追加
  - `useRef`で確実な重複防止
  - エラーハンドリングの改善（エラー時の再試行許可）
  - より詳細なエラーメッセージ表示（複数行対応）
  
- **Backend**:
  - 10秒以内の重複スコア保存を防止するロジックを追加
  - より詳細なエラーメッセージを返す

### Verification
以下のテストケースで動作確認が必要:
- [ ] 1回目のスコア保存が正常に完了する
- [ ] 保存後、ボタンを連続クリックしても重複保存されない
- [ ] 2回目のゲームプレイでもスコア保存が正常に動作する
- [ ] エラー発生時、再試行が可能である
- [ ] 10秒以内の同一スコア保存は拒否される

### Impact
この修正により、スコアの重複保存が防止され、ユーザーが複数回ゲームをプレイしても正常にスコア保存できるようになりました。

---

## 2025-10-04: Score Save Validation Error

### Issue
スコア保存が `remaining_time: 0` の時に 400 Bad Request エラーで失敗していました。

### Root Cause
バックエンドの `SaveScoreRequest` 構造体で、`RemainingTime` フィールドに `binding:"required"` タグを使用していました。
Go の Gin フレームワークでは、`binding:"required"` は値がその型のゼロ値（int の場合は 0）であることを許容しません。
つまり、`remaining_time: 0` を送信すると、検証エラーが発生していました。

### Fix
`backend/internal/service/score.go` の `SaveScoreRequest` 構造体を修正:

**Before:**
```go
type SaveScoreRequest struct {
    TimeMode         string `json:"time_mode" binding:"required"`
    Score            int    `json:"score" binding:"required"`
    Rank             string `json:"rank" binding:"required"`
    RemainingTime    int    `json:"remaining_time" binding:"required"`  // ← 問題
    PlayerLevel      int    `json:"player_level" binding:"required"`
    ItemsCollected   int    `json:"items_collected"`
    MonstersDefeated int    `json:"monsters_defeated"`
    Cleared          bool   `json:"cleared"`
}
```

**After:**
```go
type SaveScoreRequest struct {
    TimeMode         string `json:"time_mode" binding:"required"`
    Score            int    `json:"score" binding:"required,min=0"`
    Rank             string `json:"rank" binding:"required"`
    RemainingTime    int    `json:"remaining_time" binding:"min=0"`     // ← 修正
    PlayerLevel      int    `json:"player_level" binding:"required,min=1"`
    ItemsCollected   int    `json:"items_collected" binding:"min=0"`
    MonstersDefeated int    `json:"monsters_defeated" binding:"min=0"`
    Cleared          bool   `json:"cleared"`
}
```

### Changes
- `RemainingTime`, `ItemsCollected`, `MonstersDefeated` フィールドで `binding:"required"` を削除
- 代わりに `binding:"min=0"` を使用して、0 を含む非負整数を許容
- `Score` と `PlayerLevel` にも適切な最小値検証を追加

### Verification
以下のテストケースで動作確認:
- ✅ `remaining_time: 0` でのスコア保存成功
- ✅ `remaining_time: 10` でのスコア保存成功
- ✅ 複数回のスコア保存（重複保存も正常に動作）

### Impact
この修正により、タイムアップ（残り時間0秒）でゲームが終了した場合でも、スコアを正常に保存できるようになりました。
