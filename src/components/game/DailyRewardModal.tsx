'use client'

import { useDailyReward } from '@/lib/hooks/useDailyReward'
import { motion, AnimatePresence } from 'framer-motion'

export function DailyRewardModal() {
  const { rewards, showReward, setShowReward, currentStreak, todayClaimed, claimReward } = useDailyReward()

  if (!showReward) return null

  const nextDay = currentStreak + 1
  const nextReward = rewards.find(r => r.day === nextDay)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 max-w-sm w-full"
        >
          {/* Заголовок */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎁</div>
            <h2 className="text-2xl font-bold">Ежедневная награда</h2>
            <p className="text-gray-500 text-sm mt-1">
              Заходи каждый день — получай подарки!
            </p>
            <div className="text-sm mt-2">
              День <span className="font-bold text-amber-600">{nextDay}/7</span>
            </div>
          </div>

          {/* Полоска прогресса */}
          <div className="flex gap-1 mb-6">
            {rewards.map(r => (
              <div
                key={r.day}
                className={`flex-1 h-2 rounded-full transition ${
                  r.claimed ? 'bg-green-500' :
                  r.isToday ? 'bg-amber-500 animate-pulse' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Текущая награда */}
          {nextReward && (
            <div className={`rounded-2xl p-4 mb-4 text-center border-2 ${
              nextReward.isToday ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
            }`}>
              <div className="text-5xl mb-2">{nextReward.emoji}</div>
              <div className="text-xl font-bold">{nextReward.title}</div>
              <div className="text-sm text-gray-500">{nextReward.description}</div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowReward(false)}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition"
            >
              Закрыть
            </button>
            <button
              onClick={() => claimReward(nextDay)}
              disabled={todayClaimed}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-lg"
            >
              {todayClaimed ? 'Получено ✓' : 'Забрать!'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}