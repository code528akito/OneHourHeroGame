import { test, expect } from '@playwright/test'

test.describe('ワンアワー・ヒーロー ゲームプレイテスト', () => {
  test('ログインしてタイマーが0になるまでゲームプレイ', async ({ page }) => {
    // ログインページに移動
    await page.goto('http://localhost:5173')
    
    // ログイン
    await page.getByPlaceholder('ユーザー名').fill('testuser2')
    await page.getByPlaceholder('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    // メニュー画面に遷移するのを待つ
    await expect(page.getByText('時間モードを選択')).toBeVisible({ timeout: 5000 })
    console.log('✓ ログイン成功、メニュー画面表示')

    // 1分モードを選択
    await page.getByText('1分モード').click()

    // ゲーム画面に遷移
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 })
    console.log('✓ ゲーム画面表示')
    
    // タイマーが表示されている
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible()
    
    // 初期タイマーを取得
    const initialTimer = await page.getByText(/\d{2}:\d{2}/).first().textContent()
    console.log(`初期タイマー: ${initialTimer}`)

    // WASDキーでプレイヤーを動かし続ける
    console.log('WASDキーでプレイヤーを操作開始...')
    
    let moveCount = 0
    const moveInterval = setInterval(async () => {
      const keys = ['w', 'a', 's', 'd']
      const randomKey = keys[Math.floor(Math.random() * keys.length)]
      await page.keyboard.press(randomKey)
      moveCount++
      
      if (moveCount % 10 === 0) {
        const currentTimer = await page.getByText(/\d{2}:\d{2}/).first().textContent()
        console.log(`移動回数: ${moveCount}, 現在のタイマー: ${currentTimer}`)
      }
    }, 200) // 200msごとにランダムな方向に移動

    // タイマーが00:00になるまで待つ（最大70秒）
    let timerReachedZero = false
    for (let i = 0; i < 70; i++) {
      await page.waitForTimeout(1000)
      const currentTimer = await page.getByText(/\d{2}:\d{2}/).first().textContent()
      
      if (currentTimer === '00:00') {
        console.log('✓ タイマーが0になりました！')
        timerReachedZero = true
        clearInterval(moveInterval)
        break
      }
      
      if (i % 10 === 0) {
        console.log(`経過時間: ${i}秒, 現在のタイマー: ${currentTimer}`)
      }
    }

    clearInterval(moveInterval)
    expect(timerReachedZero).toBe(true)
    console.log(`✓ テスト完了！合計移動回数: ${moveCount}`)

    // ゲーム終了後の画面をスクリーンショット
    await page.screenshot({ path: 'game-finished.png' })
    console.log('✓ スクリーンショット保存: game-finished.png')
  })
})
