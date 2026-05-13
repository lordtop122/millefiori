'use client'

import { GameEngine } from '@/lib/engine/GameEngine'
import { LayoutGenerator } from '@/lib/engine/generator'
import { useGameStats } from '@/lib/hooks/useGameStats'
import { GameState } from '@/lib/engine/types'
import { getTileAppearance, suitBackgrounds, suitBorders, skinTileStyles } from '@/lib/engine/tileData'
import { useState, useCallback, useEffect, useRef } from 'react'
import { SenseiAssistant } from '@/lib/ai/assistant'
import { SenseiChat } from '@/components/game/SenseiChat'
import { useSkinStore } from '@/lib/store/skinStore'
import { DailyRewardModal } from '@/components/game/DailyRewardModal'
import Link from 'next/link'

export default function PlayPage() {
  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [hintTiles, setHintTiles] = useState<string[]>([])
  const [showStart, setShowStart] = useState(true)
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [time, setTime] = useState(0)
  const [gameSaved, setGameSaved] = useState(false)
  
  const assistantRef = useRef<SenseiAssistant | null>(null)
  const { saveGameResult } = useGameStats()
  const { equippedSkins, loadSkins } = useSkinStore()

  useEffect(() => {
    loadSkins()
  }, [])

  if (!assistantRef.current) {
    assistantRef.current = new SenseiAssistant()
  }

  const getSkinName = (category: string) => {
    const skinId = equippedSkins[category]
    const allSkins = useSkinStore.getState().allSkins
    const skin = allSkins.find(s => s.id === skinId)
    return skin?.name || ''
  }

  useEffect(() => {
    if (!state || state.isGameOver) return
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - state.startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [state])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__forceAnalysis = () => {
        if (state && assistantRef.current) {
          assistantRef.current.update(state, true)
          setHintTiles(prev => [...prev])
        }
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__forceAnalysis
      }
    }
  }, [state])

  const startGame = useCallback(() => {
    const positions = LayoutGenerator.generateFromSeed(Date.now(), difficulty)
    const newEngine = new GameEngine(positions)
    setEngine(newEngine)
    setState(newEngine.getState())
    setShowStart(false)
    setHintTiles([])
    setTime(0)
    setGameSaved(false)
  }, [difficulty])

  const refreshState = useCallback(() => {
    if (engine) setState(engine.getState())
  }, [engine])

  const handleTileClick = (tileId: string) => {
    if (!engine) return
    engine.selectTile(tileId)
    refreshState()
    setHintTiles([])
  }

  const handleHint = () => {
    if (!engine) return
    const hint = engine.getHint()
    refreshState()
    if (hint) {
      setHintTiles(hint)
      setTimeout(() => setHintTiles([]), 1500)
    }
  }

  const handleUndo = () => {
    if (!engine) return
    engine.undo()
    refreshState()
    setHintTiles([])
  }

  const formatTime = (s: number) => {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  if (showStart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🀄</div>
          <h1 className="text-5xl font-bold mb-3 text-gray-800 dark:text-amber-200">
            Millefiori
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
            Медитативный маджонг-пасьянс
          </p>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg mb-6">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
              Сложность
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'easy', label: '🌟 Лёгкая', desc: 'Для отдыха' },
                { value: 'medium', label: '⭐ Средняя', desc: 'Классика' },
                { value: 'hard', label: '💫 Сложная', desc: 'Вызов' },
                { value: 'master', label: '🔥 Мастер', desc: 'Эксперт' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`p-3 rounded-xl border-2 transition text-left ${
                    difficulty === opt.value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 shadow-md'
                      : 'border-transparent bg-gray-50 dark:bg-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-8 py-4 rounded-2xl text-xl font-medium transition shadow-lg"
          >
            Начать игру
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-2 sm:p-3 select-none">
      
      <div className="max-w-lg mx-auto mb-2 sm:mb-3">
        <div className="flex items-center justify-between bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl px-4 py-2.5 shadow-lg border border-gray-200 dark:border-gray-700">
          
          <div className="flex gap-3 sm:gap-4 text-sm font-medium">
            <div className="text-center" title="Прогресс">
              <div className="text-amber-600 text-lg">🎯</div>
              <div className="text-gray-700 dark:text-gray-300 text-xs">
                {state?.matchedPairs}/{state?.totalPairs}
              </div>
            </div>
            <div className="text-center" title="Время">
              <div className="text-blue-600 text-lg">⏱️</div>
              <div className="text-gray-700 dark:text-gray-300 text-xs">{formatTime(time)}</div>
            </div>
            <div className="text-center" title="Подсказки">
              <div className="text-cyan-600 text-lg">💡</div>
              <div className="text-gray-700 dark:text-gray-300 text-xs">{state?.hintsAvailable}</div>
            </div>
            <div className="text-center" title="Отмены">
              <div className="text-orange-600 text-lg">↩️</div>
              <div className="text-gray-700 dark:text-gray-300 text-xs">{state?.undosAvailable}</div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button onClick={handleHint} disabled={!state?.hintsAvailable}
              className="w-8 h-8 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-sm flex items-center justify-center transition shadow">
              💡
            </button>
            <button onClick={handleUndo} disabled={!state?.undosAvailable}
              className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-sm flex items-center justify-center transition shadow">
              ↩️
            </button>
            <Link href="/rewards"
              className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm flex items-center justify-center transition shadow">
              🎁
            </Link>
            <Link href="/stats"
              className="w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm flex items-center justify-center transition shadow">
              📊
            </Link>
            <button onClick={() => setShowStart(true)}
              className="w-8 h-8 bg-gray-400 hover:bg-gray-500 text-white rounded-xl text-sm flex items-center justify-center transition shadow">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div 
          className="relative bg-gradient-to-b from-green-700 via-green-800 to-green-900 dark:from-green-950 dark:via-emerald-950 dark:to-green-950 rounded-3xl shadow-2xl border-4 border-amber-800/50 dark:border-amber-700/30 overflow-hidden"
          style={{
            width: '100%',
            aspectRatio: '1',
            maxWidth: '560px',
            margin: '0 auto',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #000 0.5px, transparent 0.5px)',
              backgroundSize: '8px 8px',
            }}
          />

          {state?.tiles.map(tile => {
            if (tile.isRemoved) return null
            const appearance = getTileAppearance(tile.suit, tile.value)
            const isSelected = state.selectedTileId === tile.id
            const isHinted = hintTiles.includes(tile.id)
            const skinName = getSkinName('tiles')
            const skinStyle = skinName ? skinTileStyles[skinName] : null
            
            return (
              <div
                key={tile.id}
                onClick={() => tile.isFree && handleTileClick(tile.id)}
                className={`
                  absolute rounded-lg sm:rounded-xl cursor-pointer
                  flex flex-col items-center justify-center
                  transition-all duration-200
                  border-2 shadow-md
                  ${tile.isFree 
                    ? 'hover:scale-110 hover:shadow-2xl hover:z-50 cursor-pointer active:scale-95' 
                    : 'opacity-50 cursor-not-allowed'}
                  ${isSelected 
                    ? 'scale-110 z-40 shadow-2xl ring-2 ring-yellow-300 ring-offset-1' 
                    : ''}
                  ${isHinted 
                    ? 'animate-bounce z-40 ring-2 ring-cyan-300 ring-offset-1' 
                    : ''}
                  ${skinStyle 
                    ? `${skinStyle.bg} ${skinStyle.border}`
                    : `${suitBackgrounds[tile.suit] || 'bg-gradient-to-b from-gray-50 to-gray-200'} ${suitBorders[tile.suit] || 'border-gray-400'}`
                  }
                `}
                style={{
                  left: `${(tile.col / 10) * 90 + 1}%`,
                  top: `${(tile.row / 8) * 88 + 1}%`,
                  width: '9.5%',
                  aspectRatio: '3/4',
                  transform: `
                    translate(${tile.layer * 5}px, ${-tile.layer * 5}px)
                    ${isSelected ? 'scale(1.12)' : 'scale(1)'}
                  `,
                  zIndex: tile.layer * 10 + (isSelected || isHinted ? 100 : 0),
                  boxShadow: tile.isFree 
                    ? `2px 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)`
                    : `1px 2px 3px rgba(0,0,0,0.2)`,
                }}
              >
                <span className="text-[clamp(14px,3.5vw,24px)] font-bold leading-none"
                  style={{ color: skinStyle?.textColor || appearance.color }}>
                  {typeof tile.value === 'number' ? tile.value : ''}
                </span>
                <span className="text-[clamp(16px,4vw,30px)] leading-none my-0.5">
                  {appearance.symbol}
                </span>
                <span className="text-[clamp(6px,1.5vw,10px)] text-gray-500 dark:text-gray-400 leading-tight font-medium">
                  {appearance.label}
                </span>
              </div>
            )
          })}

          {state?.isWin && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-50">
              <div className="text-center text-white p-8">
                <div className="text-7xl mb-4">🏆</div>
                <h2 className="text-4xl font-bold mb-3">Победа!</h2>
                <div className="text-lg mb-2 text-gray-200">Время: {formatTime(time)}</div>
                <div className="text-sm text-gray-400 mb-6">
                  💡 {3 - (state?.hintsAvailable || 0)} подсказок • ↩️ {5 - (state?.undosAvailable || 0)} отмен
                </div>
                {!gameSaved && (
                  <button
                    onClick={async () => {
                      await saveGameResult({
                        difficulty,
                        status: 'won',
                        duration_seconds: time,
                        hints_used: 3 - (state?.hintsAvailable || 0),
                        undos_used: 5 - (state?.undosAvailable || 0),
                        tiles_count: state.totalPairs * 2,
                      })
                      setGameSaved(true)
                    }}
                    className="bg-green-600 hover:bg-green-500 active:scale-95 text-white px-6 py-2.5 rounded-2xl text-lg font-medium transition shadow-lg mb-3"
                  >
                    💾 Сохранить рекорд
                  </button>
                )}
                {gameSaved && (
                  <div className="text-green-400 mb-3">✅ Рекорд сохранён!</div>
                )}
                <button
                  onClick={() => {
                    setShowStart(true)
                    setGameSaved(false)
                  }}
                  className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white px-10 py-3 rounded-2xl text-lg font-medium transition shadow-lg block w-full"
                >
                  Играть снова
                </button>
              </div>
            </div>
          )}

          {state && !state.isWin && state.tiles.filter(t => t.isFree && !t.isRemoved).length === 0 && state.matchedPairs < state.totalPairs && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-50">
              <div className="text-center text-white p-8">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-3xl font-bold mb-3">Нет ходов</h2>
                <p className="text-gray-300 mb-6">Попробуйте отменить последний ход</p>
                <button
                  onClick={handleUndo}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl text-lg font-medium transition"
                >
                  ↩️ Отменить ход
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {assistantRef.current && (
        <SenseiChat assistant={assistantRef.current} onTutorialComplete={() => {}} />
      )}

      <DailyRewardModal />
    </div>
  )
}