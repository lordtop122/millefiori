'use client'

import { useDailyReward } from '@/lib/hooks/useDailyReward'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RewardsPage() {
  const { rewards, currentStreak, todayClaimed, claimReward, showReward, setShowReward } = useDailyReward()

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <Link href="/" className="text-amber-600 text-sm mb-2 inline-block">← На главную</Link>
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ежедневные награды</h1>
          <p className="text-gray-500 mt-2 capitalize">{formatDate()}</p>
          
          {/* Статистика */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow">
              <div className="text-2xl font-bold text-amber-600">{currentStreak}/7</div>
              <div className="text-xs text-gray-500">Дней подряд</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow">
              <div className="text-2xl font-bold text-green-600">
                {rewards.filter(r => r.claimed).length}
              </div>
              <div className="text-xs text-gray-500">Получено</div>
            </div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow mb-6">
          <div className="text-sm text-gray-500 mb-2">Прогресс недели</div>
          <div className="flex gap-1.5 mb-2">
            {rewards.map(r => (
              <div
                key={r.day}
                className={`flex-1 h-3 rounded-full transition-all ${
                  r.claimed ? 'bg-green-500' :
                  r.isToday ? 'bg-amber-500 animate-pulse' :
                  'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>День 1</span>
            <span>День 7</span>
          </div>
        </div>

        {/* Список наград */}
        <div className="space-y-3">
          {rewards.map((reward, index) => {
            const isLocked = !reward.claimed && !reward.isToday
            const isClaimed = reward.claimed
            const isToday = reward.isToday

            return (
              <motion.div
                key={reward.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow flex items-center gap-4 transition border-2 ${
                  isClaimed ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
                  isToday ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-lg' :
                  'border-gray-100 dark:border-gray-700 opacity-60'
                }`}
              >
                {/* Номер дня */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                  isClaimed ? 'bg-green-500 text-white' :
                  isToday ? 'bg-amber-500 text-white' :
                  'bg-gray-200 dark:bg-gray-600 text-gray-500'
                }`}>
                  {isClaimed ? '✓' : reward.day}
                </div>

                {/* Иконка и описание */}
                <div className="flex-1">
                  <div className="text-3xl mb-1">{isLocked ? '🔒' : reward.emoji}</div>
                  <div className="font-bold text-gray-800 dark:text-white">
                    {isLocked ? '???' : reward.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isLocked ? 'Заходи каждый день чтобы открыть' : reward.description}
                  </div>
                </div>

                {/* Статус */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-green-500 text-sm font-medium">Получено ✓</span>
                  ) : isToday ? (
                    <button
                      onClick={() => claimReward(reward.day)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm transition shadow-lg"
                    >
                      Забрать!
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">День {reward.day}</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Инфо */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow text-center">
          <p className="text-sm text-gray-500">
            🎯 Заходи каждый день чтобы получить все награды!
            <br />
            Пропустишь день — начнёшь сначала.
          </p>
        </div>
      </div>

      {/* Модальное окно получения */}
      {showReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Награда получена!</h2>
            <p className="text-gray-500 mb-6">
              {rewards.find(r => r.day === currentStreak + 1)?.title}
            </p>
            <button
              onClick={() => setShowReward(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition"
            >
              Отлично!
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}