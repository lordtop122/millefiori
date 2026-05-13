'use client'

import { SenseiAssistant, ChatMessage } from '@/lib/ai/assistant'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SenseiChatProps {
  assistant: SenseiAssistant
  onTutorialComplete?: () => void
}

export function SenseiChat({ assistant, onTutorialComplete }: SenseiChatProps) {
  const [state, setState] = useState(assistant.getState())
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const refreshState = () => setState(assistant.getState())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  const handleSend = () => {
    if (!input.trim()) return
    if (state.mode === 'tutorial') {
      const next = assistant.nextTutorialStep()
      if (!next) onTutorialComplete?.()
    } else {
      assistant.reply(input)
    }
    setInput('')
    refreshState()
  }

  const handleForceAnalysis = () => {
    if ((window as any).__forceAnalysis) {
      (window as any).__forceAnalysis()
      refreshState()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend()
  }

  // Кнопка открытия чата (когда свёрнут)
  if (state.isMinimized && state.mode === 'playing') {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => {
          assistant.toggle()
          refreshState()
        }}
        className="fixed bottom-4 right-4 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition hover:scale-110"
      >
        🤖
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 overflow-hidden flex flex-col max-h-[450px]">
          
          {/* Шапка */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="text-white font-medium">Сэнсэй</span>
              {state.mode === 'tutorial' && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {state.tutorialStep + 1}/6
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {state.mode === 'playing' && (
                <button onClick={() => { assistant.hide(); refreshState() }} className="text-white/70 hover:text-white px-1">
                  ─
                </button>
              )}
              <button onClick={() => { assistant.hide(); refreshState() }} className="text-white/70 hover:text-white px-1">
                ✕
              </button>
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px] max-h-[250px]">
            {state.messages.map((msg: ChatMessage, i: number) => (
              <div
                key={i}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.from === 'user'
                      ? 'bg-amber-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-md'
                  }`}
                >
                  <span className="whitespace-pre-line">{msg.text}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 shrink-0">
            {state.mode === 'tutorial' ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSend}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-sm font-medium transition"
                >
                  {state.tutorialStep >= 5 ? '🎮 Играть!' : 'Далее →'}
                </button>
                <button
                  onClick={() => { assistant.skipTutorial(); onTutorialComplete?.(); refreshState() }}
                  className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm transition"
                >
                  Пропустить
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleForceAnalysis}
                  className="px-2 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs transition"
                  title="Анализ поля"
                >
                  🔍
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спроси что-нибудь..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm border-none outline-none"
                />
                <button
                  onClick={handleSend}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm transition"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}