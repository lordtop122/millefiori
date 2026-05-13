'use client'

import { useGameStats } from '@/lib/hooks/useGameStats'
import Link from 'next/link'

export default function StatsPage() {
  const { stats, recentGames, loading } = useGameStats()

  const formatTime = (s: number) => {
    if (!s || s === 0) return '-'
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
        <p className="text-xl">⏳ Загрузка статистики...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📊 Статистика</h1>
          <Link href="/" className="text-amber-600 hover:underline text-sm">← На главную</Link>
        </div>

        {stats ? (
          <>
            {/* Карточки */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                <div className="text-3xl mb-1">🎮</div>
                <div className="text-2xl font-bold">{stats.total_games}</div>
                <div className="text-sm text-gray-500">Всего игр</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                <div className="text-3xl mb-1">🏆</div>
                <div className="text-2xl font-bold">{stats.total_wins}</div>
                <div className="text-sm text-gray-500">Побед ({stats.win_rate}%)</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                <div className="text-3xl mb-1">⚡</div>
                <div className="text-2xl font-bold">{formatTime(stats.best_time)}</div>
                <div className="text-sm text-gray-500">Лучшее время</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                <div className="text-3xl mb-1">📈</div>
                <div className="text-2xl font-bold">{stats.win_rate}%</div>
                <div className="text-sm text-gray-500">Процент побед</div>
              </div>
            </div>

            {/* Последние игры */}
            <h2 className="text-lg font-bold mb-3">Последние игры</h2>
            <div className="space-y-2">
              {recentGames.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Пока нет игр. Сыграйте первую!
                </div>
              )}
              {recentGames.map((game, index) => (
                <div key={game.id || index} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{game.won ? '🏆' : '😔'}</div>
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {game.difficulty}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(game.played_at).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatTime(game.time_seconds)}</div>
                    <div className="text-xs text-gray-500">
                      💡{game.hints_used} ↩️{game.undos_used}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-3">📊</div>
            <p>Войдите в аккаунт чтобы увидеть статистику</p>
            <Link href="/login" className="text-amber-600 mt-4 inline-block">
              Войти →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}