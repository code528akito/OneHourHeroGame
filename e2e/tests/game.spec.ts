import { test, expect } from '@playwright/test'

test.describe('ワンアワー・ヒーロー E2E テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('ログインページが表示される', async ({ page }) => {
    await expect(page.getByText('ワンアワー・ヒーロー')).toBeVisible()
    await expect(page.getByPlaceholder('ユーザー名')).toBeVisible()
    await expect(page.getByPlaceholder('パスワード')).toBeVisible()
  })

  test('ログイン → メニュー → ゲーム開始まで', async ({ page }) => {
    // ログイン
    await page.getByPlaceholder('ユーザー名').fill('testuser2')
    await page.getByPlaceholder('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    // メニュー画面に遷移するのを待つ
    await expect(page.getByText('時間モードを選択')).toBeVisible({ timeout: 5000 })

    // 1分モードを選択
    await page.getByText('1分モード').click()

    // ゲーム画面に遷移
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 })
    
    // タイマーが表示されている
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible()
  })

  test('プレイヤー移動とタイマー動作確認', async ({ page }) => {
    // ログイン
    await page.getByPlaceholder('ユーザー名').fill('testuser2')
    await page.getByPlaceholder('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('時間モードを選択')).toBeVisible({ timeout: 5000 })

    // 1分モードを選択
    await page.getByText('1分モード').click()

    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 })

    // 初期タイマーを取得
    const initialTimer = await page.getByText(/\d{2}:\d{2}/).first().textContent()
    
    // WASDキーで移動
    await page.keyboard.press('w')
    await page.keyboard.press('a')
    await page.keyboard.press('s')
    await page.keyboard.press('d')

    // 少し待つ
    await page.waitForTimeout(2000)

    // タイマーが減っているか確認
    const currentTimer = await page.getByText(/\d{2}:\d{2}/).first().textContent()
    expect(initialTimer).not.toBe(currentTimer)

    // ESCキーでポーズ
    await page.keyboard.press('Escape')
    await expect(page.getByText('一時停止')).toBeVisible({ timeout: 2000 })
  })

  test('新規登録機能', async ({ page }) => {
    await page.getByText('アカウントを作成').click()

    await expect(page.getByText('アカウント作成')).toBeVisible()

    // ランダムなユーザー名を生成
    const randomUser = `testuser_${Date.now()}`
    
    await page.getByPlaceholder('ユーザー名').fill(randomUser)
    await page.getByPlaceholder('パスワード (6文字以上)').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    
    await page.getByRole('button', { name: '登録' }).click()

    // メニュー画面に遷移するのを待つ
    await expect(page.getByText('時間モードを選択')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(`ようこそ、${randomUser}さん`)).toBeVisible()
  })

  test('ゲームHUDが表示される', async ({ page }) => {
    // ログインしてゲーム開始
    await page.getByPlaceholder('ユーザー名').fill('testuser2')
    await page.getByPlaceholder('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('時間モードを選択')).toBeVisible({ timeout: 5000 })
    await page.getByText('1分モード').click()

    // HUD要素の確認
    await expect(page.getByText('Lv.1')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('HP')).toBeVisible()
    await expect(page.getByText('EXP')).toBeVisible()
  })

  test('5つの時間モードがすべて選択可能', async ({ page }) => {
    // ログイン
    await page.getByPlaceholder('ユーザー名').fill('testuser2')
    await page.getByPlaceholder('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('時間モードを選択')).toBeVisible({ timeout: 5000 })

    // 各時間モードが表示されているか確認
    await expect(page.getByText('1分モード')).toBeVisible()
    await expect(page.getByText('5分モード')).toBeVisible()
    await expect(page.getByText('10分モード')).toBeVisible()
    await expect(page.getByText('30分モード')).toBeVisible()
    await expect(page.getByText('60分モード')).toBeVisible()
  })
})
