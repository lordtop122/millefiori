// src/lib/hooks/useDailyReward.ts
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export interface DailyReward {
  day: number
  emoji: string
  title: string
  description: string
  claimed: boolean
  isToday: boolean
}

export function useDailyReward() {
  const [rewards, setRewards] = useState<DailyReward[]>([])
  const [showReward, setShowReward] = useState(false)
  const [todayClaimed, setTodayClaimed] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const supabase = createClient()

  // Конфигурация наград
  const rewardConfig = [
    { day: 1, emoji: '💡', title: '+2 Подсказки', description: 'Дополнительные подсказки на сегодня' },
    { day: 2, emoji: '↩️', title: '+2 Отмены', description: 'Дополнительные отмены на сегодня' },
    { day: 3, emoji: '⭐', title: '+50 Очков', description: 'Бонусные очки рейтинга' },
    { day: 4, emoji: '💡', title: '+3 Подсказки', description: 'Ещё больше подсказок' },
    { day: 5, emoji: '🎁', title: 'Скин "Нефрит"', description: 'Эксклюзивный скин тайлов' },
    { day: 6, emoji: '↩️', title: '+3 Отмены', description: 'Максимум отмен на сегодня' },
    { day: 7, emoji: '🏆', title: '+100 Очков', description: 'Большой бонус рейтинга!' },
  ]

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Получаем историю наград
    const { data: claimed } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('day_number')

    const claimedDays = claimed?.map(c => c.day_number) || []
    
    // Определяем текущий день (простой алгоритм)
    let streak = 0
    for (let i = 1; i <= 7; i++) {
      if (claimedDays.includes(i)) {
        streak = i
      } else {
        break
      }
    }

    const today = new Date().getDay() || 7 // 1-7
    const todayClaimedAlready = claimed?.some(c => {
      const claimDate = new Date(c.claimed_at)
      const now = new Date()
      return claimDate.toDateString() === now.toDateString()
    })

    setCurrentStreak(streak)
    setTodayClaimed(todayClaimedAlready || false)

    // Формируем награды для отображения
    const rewardList = rewardConfig.map(r => ({
      ...r,
      claimed: claimedDays.includes(r.day),
      isToday: r.day === streak + 1 && !todayClaimedAlready,
    }))

    setRewards(rewardList)

    // Показываем окно если сегодня ещё не получали
    if (!todayClaimedAlready) {
      setShowReward(true)
    }
  }

  const claimReward = async (day: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (day !== currentStreak + 1) return

    const reward = rewardConfig[day - 1]
    if (!reward) return

    // Сохраняем награду
    await supabase.from('daily_rewards').insert({
      user_id: user.id,
      day_number: day,
      reward_type: reward.emoji.includes('💡') ? 'hints' : 
                   reward.emoji.includes('↩️') ? 'undos' : 
                   reward.emoji.includes('🎁') ? 'skin' : 'score',
      reward_amount: day === 7 ? 100 : day >= 3 ? 50 : day >= 1 ? 2 : 0,
    })

    // Если скин — добавляем его
    if (day === 5) {
      const { data: skin } = await supabase
        .from('skins')
        .select('id')
        .eq('name', 'Нефрит')
        .single()

      if (skin) {
        await supabase.from('user_skins').upsert({
          user_id: user.id,
          skin_id: skin.id,
        })
      }
    }

    setTodayClaimed(true)
    setShowReward(false)
    loadRewards()
  }

  return {
    rewards,
    showReward,
    setShowReward,
    todayClaimed,
    currentStreak,
    claimReward,
    loadRewards,
  }
}