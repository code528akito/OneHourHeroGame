import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'
import { GameEngine } from '@/systems/GameEngine'
import { GameResult } from '@/systems/ScoreSystem'
import { ItemType } from '@/models/Item'
import { SkillType } from '@/models/Skill'
import { NPC, Monument, Dialog } from '@/models/NPC'
import TimerDisplay from './TimerDisplay'
import GameHUD from './GameHUD'
import ItemBar from './ItemBar'
import SkillBar from './SkillBar'
import ResultScreen from './ResultScreen'
import { DialogUI, MonumentUI } from './DialogUI'

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const { timeMode, classType, setGameState } = useGameStore()
  const navigate = useNavigate()

  const [timer, setTimer] = useState('00:00')
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    hp: 100,
    maxHp: 100,
    exp: 0,
    maxExp: 100,
    classType: classType || 'KNIGHT',
  })
  const [items, setItems] = useState<any[]>([])
  const [itemDataMap, setItemDataMap] = useState<Map<ItemType, any>>(new Map())
  const [skills, setSkills] = useState<any[]>([])
  const [skillDataMap, setSkillDataMap] = useState<Map<SkillType, any>>(new Map())

  // NPC会話と石碑調査の状態
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null)
  const [activeMonument, setActiveMonument] = useState<Monument | null>(null)
  const [currentDialog, setCurrentDialog] = useState<Dialog | null>(null)

  useEffect(() => {
    if (!timeMode) {
      navigate('/menu')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const gameEngine = new GameEngine(canvas)
    gameEngineRef.current = gameEngine

    gameEngine.startGame(timeMode, classType || 'KNIGHT')

    const timerInterval = setInterval(() => {
      const timerSystem = gameEngine.getTimerSystem()
      setTimer(timerSystem.getFormattedTime())
      setProgress(timerSystem.getProgress())

      const player = gameEngine.getPlayer()
      if (player) {
        const stats = player.getStats()
        setPlayerStats({
          level: stats.level,
          hp: stats.hp,
          maxHp: stats.maxHp,
          exp: stats.exp,
          maxExp: stats.maxExp,
          classType: player.getClassType(),
        })

        // アイテム情報の更新
        const itemSystem = player.getItemSystem()
        const allItems = itemSystem.getAllItems()
        setItems(allItems)
        
        const itemMap = new Map()
        allItems.forEach(item => {
          const data = itemSystem.getItemData(item.type)
          if (data) itemMap.set(item.type, data)
        })
        setItemDataMap(itemMap)

        // スキル情報の更新
        const skillSystem = player.getSkillSystem()
        const allSkills = skillSystem.getAllSkills()
        setSkills(allSkills)
        
        const skillMap = new Map()
        allSkills.forEach(skill => {
          const data = skillSystem.getSkillData(skill.type)
          if (data) skillMap.set(skill.type, data)
        })
        setSkillDataMap(skillMap)
      }

      // ゲームオーバー判定
      if (gameEngine.getStateManager().isGameOver()) {
        clearInterval(timerInterval)
        const result = gameEngine.getGameResult()
        if (result) {
          setGameResult(result)
        }
      }
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameEngine.getStateManager().isGameOver()) {
          // リザルト画面で処理
        } else {
          togglePause()
        }
      } else if (e.key === 'e' || e.key === 'E') {
        // NPCと会話
        if (gameEngine.interactWithNearbyNPC()) {
          const npc = gameEngine.getActiveNPC()
          if (npc) {
            setActiveNPC(npc)
            setCurrentDialog(npc.getCurrentDialog() || null)
          }
        }
        // 石碑を調査
        else if (gameEngine.interactWithNearbyMonument()) {
          const monument = gameEngine.getActiveMonument()
          if (monument) {
            setActiveMonument(monument)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(timerInterval)
      window.removeEventListener('keydown', handleKeyDown)
      if (gameEngineRef.current) {
        gameEngineRef.current.stopGame()
        const player = gameEngineRef.current.getPlayer()
        if (player) {
          player.destroy()
        }
      }
    }
  }, [timeMode, navigate])

  const togglePause = () => {
    if (!gameEngineRef.current) return

    if (isPaused) {
      gameEngineRef.current.resumeGame()
      setIsPaused(false)
    } else {
      gameEngineRef.current.pauseGame()
      setIsPaused(true)
    }
  }

  const handleBackToMenu = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stopGame()
    }
    setGameState('TITLE_SCREEN')
    navigate('/menu')
  }

  const handleUseItem = (type: ItemType) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.useItem(type)
    }
  }

  const handleUseSkill = (type: SkillType) => {
    if (gameEngineRef.current) {
      const player = gameEngineRef.current.getPlayer()
      if (player) {
        player.useSkill(type)
      }
    }
  }

  // NPC会話ハンドラー
  const handleDialogOptionSelect = (option: { nextDialogId?: string; action?: () => void }) => {
    if (option.action) {
      option.action()
    }

    if (option.nextDialogId && activeNPC) {
      activeNPC.setDialogId(option.nextDialogId)
      setCurrentDialog(activeNPC.getCurrentDialog() || null)
    } else {
      handleCloseDialog()
    }
  }

  const handleSkipDialog = () => {
    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.closeDialog()
    }
    setActiveNPC(null)
    setCurrentDialog(null)
  }

  // 石碑調査ハンドラー
  const handleCloseMonument = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.closeDialog()
    }
    setActiveMonument(null)
  }

  const handleCloseResult = () => {
    setGameResult(null)
    handleBackToMenu()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      <TimerDisplay formattedTime={timer} progress={progress} />
      <GameHUD
        playerLevel={playerStats.level}
        playerHp={playerStats.hp}
        playerMaxHp={playerStats.maxHp}
        playerExp={playerStats.exp}
        playerMaxExp={playerStats.maxExp}
        playerClass={playerStats.classType}
      />

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-gray-700 rounded-lg shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />

        {isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-4">一時停止</div>
              <div className="text-gray-300 mb-6">
                ESCキーで再開 / タイマーは止まりません
              </div>
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mr-4"
              >
                再開
              </button>
              <button
                onClick={handleBackToMenu}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                メニューに戻る
              </button>
            </div>
          </div>
        )}
      </div>

      <ItemBar items={items} itemDataMap={itemDataMap} onUseItem={handleUseItem} />
      <SkillBar skills={skills} skillDataMap={skillDataMap} onUseSkill={handleUseSkill} />

      <div className="mt-4 text-center">
        <div className="text-gray-400 text-sm mb-2">
          <div>移動: WASD または 矢印キー | アイテム: 1-3 | スキル: Q, E</div>
          <div>ESC: ポーズ/メニュー | E: NPC会話/石碑調査</div>
        </div>
      </div>

      {/* NPC会話ダイアログ */}
      {activeNPC && currentDialog && (
        <DialogUI
          npcName={activeNPC.name}
          dialog={currentDialog}
          onOptionSelect={handleDialogOptionSelect}
          onSkip={handleSkipDialog}
          onClose={handleCloseDialog}
        />
      )}

      {/* 石碑調査UI */}
      {activeMonument && (
        <MonumentUI
          title={activeMonument.title}
          text={activeMonument.text}
          onClose={handleCloseMonument}
        />
      )}

      {gameResult && (
        <ResultScreen result={gameResult} onClose={handleCloseResult} />
      )}
    </div>
  )
}
