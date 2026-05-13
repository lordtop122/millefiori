'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DailyChallengePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Просто ждём загрузку
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
        <p className="text-xl">⏳ Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="text-3xl font-bold mb-4">Ежедневное задание</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-2">⚡ Скоростной раунд</h2>
          <p className="text-gray-500 mb-4">Разбери поле меньше чем за 3 минуты!</p>
          <div className="flex justify-center gap-3 text-sm mb-4">
            <span className="bg-amber-100 dark:bg-amber-900 px-3 py-1 rounded-full">⭐ Средняя</span>
            <span className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">+150 очков</span>
          </div>
          <p className="text-sm text-gray-400">⏱️ Цель: менее 3 мин</p>
        </div>

        <Link
          href="/play"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl text-xl font-medium transition shadow-lg"
        >
          🎮 Начать задание
        </Link>

        <div className="mt-4">
          <Link href="/" className="text-gray-400 text-sm">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  )
}