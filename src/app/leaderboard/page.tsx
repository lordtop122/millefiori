'use client'

import { useLeaderboard, LeaderboardEntry } from '@/lib/hooks/useLeaderboard'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const { entries, loading, sortBy, setSortBy, formatTime, getMyRank } = useLeaderboard()
  const [myRank, setMyRank] = useState<{ rank: number; entry: LeaderboardEntry | null }>({ rank: 0, entry: null })

  useEffect(() => {
    getMyRank().then(setMyRank)
  }, [entries])

  const getMedal = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return ''
  }

  const getRowStyle = (index: number, isMe: boolean) => {
    if (isMe) return 'bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500'
    if (index < 3) return 'bg-yellow-50/50 dark:bg-yellow-900/10'
    return ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🏆 Таблица лидеров</h1>
          <Link href="/" className="text-amber-600 hover:underline text-sm">← На главную</Link>
        </div>

        {/* Мой ранг */}
        {myRank.entry && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg mb-6 border-2 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Мой рейтинг</div>
                <div className="text-2xl font-bold">#{myRank.rank}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{myRank.entry.username || 'Игрок'}</div>
                <div className="text-sm text-gray-500">
                  🏆 {myRank.entry.total_score} очков • 🎮 {myRank.entry.games_won}/{myRank.entry.games_played} побед
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки сортировки */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'score', label: '🏆 Очки', title: 'По общим очкам' },
            { key: 'time', label: '⚡ Время', title: 'По лучшему времени' },
            { key: 'wins', label: '🎮 Победы', title: 'По количеству побед' },
            { key: 'winrate', label: '📈 % Побед', title: 'По проценту побед' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key as any)}
              title={opt.title}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                sortBy === opt.key
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Таблица */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">⏳ Загрузка...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">🏆</div>
              <p>Пока никто не играл. Стань первым!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                    <th className="p-3 text-left w-12">#</th>
                    <th className="p-3 text-left">Игрок</th>
                    <th className="p-3 text-center">Очки</th>
                    <th className="p-3 text-center hidden sm:table-cell">Победы</th>
                    <th className="p-3 text-center hidden sm:table-cell">Лучшее</th>
                    <th className="p-3 text-center hidden md:table-cell">%</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.user_id}
                      className={`border-b border-gray-100 dark:border-gray-700 transition ${getRowStyle(index, entry.user_id === myRank.entry?.user_id)}`}
                    >
                      <td className="p-3 text-center">
                        {getMedal(index) || (
                          <span className="text-gray-400 text-sm">{index + 1}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-sm">
                          {entry.username || 'Аноним'}
                          {entry.user_id === myRank.entry?.user_id && (
                            <span className="ml-1 text-xs text-amber-500">(вы)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-600">
                        {entry.total_score}
                      </td>
                      <td className="p-3 text-center text-sm hidden sm:table-cell">
                        {entry.games_won}/{entry.games_played}
                      </td>
                      <td className="p-3 text-center text-sm hidden sm:table-cell">
                        {formatTime(entry.best_time_seconds)}
                      </td>
                      <td className="p-3 text-center text-sm hidden md:table-cell">
                        {entry.win_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-gray-400">
          Сыграйте и победите чтобы попасть в таблицу лидеров!
        </div>
      </div>
    </div>
  )
}