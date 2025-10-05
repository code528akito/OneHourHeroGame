import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { UserSettings } from '@/types'

export default function SettingsView() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getSettings()
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError('設定の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings || saving) return

    setSaving(true)
    setError(null)
    setSaveMessage(null)

    try {
      const updated = await apiClient.updateSettings({
        sound_volume: settings.sound_volume,
        music_volume: settings.music_volume,
      })
      setSettings(updated)
      setSaveMessage('設定を保存しました')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError('設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSoundVolumeChange = (value: number) => {
    if (settings) {
      setSettings({ ...settings, sound_volume: value })
    }
  }

  const handleMusicVolumeChange = (value: number) => {
    if (settings) {
      setSettings({ ...settings, music_volume: value })
    }
  }

  if (loading) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">設定</h3>
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">設定</h3>
        <div className="text-center py-8 text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">設定</h3>

      {saveMessage && (
        <div className="mb-4 bg-green-900 border border-green-600 text-green-200 rounded-lg p-3 text-sm">
          ✓ {saveMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-900 border border-red-600 text-red-200 rounded-lg p-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-6">
        {/* 効果音の音量 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            効果音の音量: {Math.round((settings?.sound_volume || 1.0) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings?.sound_volume || 1.0}
            onChange={e => handleSoundVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(settings?.sound_volume || 1.0) * 100}%, #374151 ${(settings?.sound_volume || 1.0) * 100}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* BGMの音量 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            BGMの音量: {Math.round((settings?.music_volume || 1.0) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings?.music_volume || 1.0}
            onChange={e => handleMusicVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(settings?.music_volume || 1.0) * 100}%, #374151 ${(settings?.music_volume || 1.0) * 100}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              saving
                ? 'bg-gray-600 text-gray-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>

        {/* 説明 */}
        <div className="text-xs text-gray-400 pt-4 border-t border-gray-700">
          <p>※ 現在、サウンドシステムは実装中です。音量設定は保存されますが、実際の音声再生には反映されません。</p>
        </div>
      </div>
    </div>
  )
}
