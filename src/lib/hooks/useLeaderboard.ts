// src/lib/hooks/useLeaderboard.ts
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export interface LeaderboardEntry {
  user_id: string
  username: string
  total_score: number
  games_played: number
  games_won: number
  best_time_seconds: number
  avg_time_seconds: number
  win_rate: number
  last_played_at: string
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'wins' | 'winrate'>('score')
  const supabase = createClient()

  useEffect(() => {
    loadLeaderboard()
  }, [sortBy])

  const loadLeaderboard = async () => {
    setLoading(true)
    
    let orderColumn = 'total_score'
    if (sortBy === 'time') orderColumn = 'best_time_seconds'
    if (sortBy === 'wins') orderColumn = 'games_won'
    if (sortBy === 'winrate') orderColumn = 'win_rate'
    
    const ascending = sortBy === 'time' // время по возрастанию (меньше = лучше)
    
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order(orderColumn, { ascending })
      .limit(50)

    setEntries(data || [])
    setLoading(false)
  }

  const formatTime = (s: number) => {
    if (!s || s === 0) return '-'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Получить ранг текущего игрока
  const getMyRank = async (): Promise<{ rank: number; entry: LeaderboardEntry | null }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { rank: 0, entry: null }

    const { data: allEntries } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_score', { ascending: false })

    if (!allEntries) return { rank: 0, entry: null }

    const myIndex = allEntries.findIndex(e => e.user_id === user.id)
    return {
      rank: myIndex + 1,
      entry: myIndex >= 0 ? allEntries[myIndex] : null,
    }
  }

  return {
    entries,
    loading,
    sortBy,
    setSortBy,
    formatTime,
    getMyRank,
    loadLeaderboard,
  }
}