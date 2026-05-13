// src/lib/hooks/useGameStats.ts
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface GameRecord {
  id: string
  difficulty: string
  time_seconds: number
  hints_used: number
  undos_used: number
  tiles_count: number
  won: boolean
  played_at: string
}

interface UserStats {
  total_games: number
  total_wins: number
  win_rate: number
  best_time: number
  records: GameRecord[]
}

export function useGameStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentGames, setRecentGames] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Загружаем все игры пользователя
    const { data: games } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('finished_at', { ascending: false })
      .limit(50)

    if (games) {
      const wonGames = games.filter(g => g.status === 'won')
      const bestGame = wonGames.reduce((best, g) => 
        g.duration_seconds < best.duration_seconds ? g : best, 
        wonGames[0]
      )

      setStats({
        total_games: games.length,
        total_wins: wonGames.length,
        win_rate: games.length > 0 ? Math.round((wonGames.length / games.length) * 100) : 0,
        best_time: bestGame?.duration_seconds || 0,
        records: games.map(g => ({
          id: g.id,
          difficulty: g.difficulty || 'medium',
          time_seconds: g.duration_seconds || 0,
          hints_used: g.hints_used || 0,
          undos_used: g.undos_used || 0,
          tiles_count: g.tiles_count || 0,
          won: g.status === 'won',
          played_at: g.finished_at || g.started_at,
        }))
      })

      setRecentGames(games.slice(0, 10).map(g => ({
        id: g.id,
        difficulty: g.difficulty || 'medium',
        time_seconds: g.duration_seconds || 0,
        hints_used: g.hints_used || 0,
        undos_used: g.undos_used || 0,
        tiles_count: g.tiles_count || 0,
        won: g.status === 'won',
        played_at: g.finished_at || g.started_at,
      })))
    }
  }

  // Сохранить результат игры
  const saveGameResult = async (data: {
    layout_id?: string
    difficulty: string
    status: 'won' | 'lost'
    duration_seconds: number
    hints_used: number
    undos_used: number
    tiles_count: number
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)
    
    const { error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        layout_id: data.layout_id || null,
        difficulty: data.difficulty,
        status: data.status,
        duration_seconds: data.duration_seconds,
        hints_used: data.hints_used,
        undos_used: data.undos_used,
        tiles_count: data.tiles_count,
        finished_at: new Date().toISOString(),
      })

    if (!error) {
      await loadStats() // Обновляем статистику
    }
    
    setLoading(false)
    return error
  }

  return {
    stats,
    recentGames,
    loading,
    saveGameResult,
    loadStats,
  }
}