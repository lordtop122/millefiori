// src/lib/engine/dailyChallenge.ts
import { createClient } from '@/lib/supabase/client'

export interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  difficulty: string
  seed: string
  specialRule?: string
  targetTime?: number
  bonusPoints: number
}

export interface ChallengeResult {
  completed: boolean
  timeSeconds?: number
  hintsUsed?: number
  undosUsed?: number
  score?: number
}

// Специальные правила для заданий
const specialRules = [
  {
    title: 'Скоростной раунд',
    description: 'Разбери поле меньше чем за 3 минуты!',
    rule: 'speed',
    targetTime: 180,
    bonusPoints: 150,
  },
  {
    title: 'Без подсказок',
    description: 'Победи, не используя ни одной подсказки!',
    rule: 'no_hints',
    bonusPoints: 200,
  },
  {
    title: 'Минимум отмен',
    description: 'Используй не больше 1 отмены за всю игру',
    rule: 'min_undos',
    bonusPoints: 175,
  },
  {
    title: 'Идеальный путь',
    description: 'Победи без единой подсказки и отмены!',
    rule: 'perfect',
    bonusPoints: 300,
  },
  {
    title: 'Верхний слой',
    description: 'Сначала убери все тайлы с верхнего слоя!',
    rule: 'top_first',
    bonusPoints: 125,
  },
  {
    title: 'Драконий день',
    description: 'На поле только драконы и ветра — редкие тайлы!',
    rule: 'special_tiles',
    bonusPoints: 250,
  },
]

// Генерация задания на сегодня
function generateTodayChallenge(): DailyChallenge {
  const today = new Date().toISOString().split('T')[0]
  const daySeed = hashDate(today)
  const rule = specialRules[daySeed % specialRules.length]
  const difficulties = ['easy', 'medium', 'hard', 'master']
  const difficulty = difficulties[daySeed % difficulties.length]

  return {
    id: '',
    date: today,
    title: rule.title,
    description: rule.description,
    difficulty,
    seed: today,
    specialRule: rule.rule,
    targetTime: rule.targetTime,
    bonusPoints: rule.bonusPoints,
  }
}

// Хеш даты для детерминированной генерации
function hashDate(date: string): number {
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
  }
  return Math.abs(hash)
}

// Получить сегодняшнее задание (создаёт если нет)
export async function getTodayChallenge(): Promise<DailyChallenge> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Ищем существующее
  const { data: existing } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('date', today)
    .single()

  if (existing) {
    return {
      id: existing.id,
      date: existing.date,
      title: existing.title,
      description: existing.description,
      difficulty: existing.difficulty,
      seed: existing.seed,
      specialRule: existing.special_rule,
      targetTime: existing.target_time_seconds,
      bonusPoints: existing.bonus_points,
    }
  }

  // Создаём новое
  const challenge = generateTodayChallenge()
  const { data: created } = await supabase
    .from('daily_challenges')
    .insert({
      date: today,
      seed: challenge.seed,
      difficulty: challenge.difficulty,
      title: challenge.title,
      description: challenge.description,
      special_rule: challenge.specialRule,
      target_time_seconds: challenge.targetTime,
      bonus_points: challenge.bonusPoints,
    })
    .select()
    .single()

  return { ...challenge, id: created?.id || '' }
}

// Проверить выполнение задания
export async function checkChallengeCompletion(
  challengeId: string,
  timeSeconds: number,
  hintsUsed: number,
  undosUsed: number,
  specialRule?: string
): Promise<{ completed: boolean; score: number; message: string }> {
  
  let completed = true
  let bonusScore = 0
  let message = ''

  switch (specialRule) {
    case 'speed':
      if (timeSeconds <= 180) {
        bonusScore = 150
        message = '⚡ Молниеносная победа! +150 очков!'
      } else {
        completed = false
        message = '⏱️ Не уложился в 3 минуты. Попробуй ещё раз!'
      }
      break
    case 'no_hints':
      if (hintsUsed === 0) {
        bonusScore = 200
        message = '🧠 Чистая победа без подсказок! +200 очков!'
      } else {
        completed = false
        message = '💡 Ты использовал подсказку. Попробуй без них!'
      }
      break
    case 'min_undos':
      if (undosUsed <= 1) {
        bonusScore = 175
        message = '🎯 Отличный контроль! +175 очков!'
      } else {
        completed = false
        message = '↩️ Слишком много отмен. Держись в пределах одной!'
      }
      break
    case 'perfect':
      if (hintsUsed === 0 && undosUsed === 0) {
        bonusScore = 300
        message = '👑 Идеальная игра! Ты настоящий мастер! +300 очков!'
      } else {
        completed = false
        message = '🎯 Нужна идеальная игра без подсказок и отмен!'
      }
      break
    default:
      completed = true
      bonusScore = 50
      message = '✅ Задание выполнено! +50 очков!'
  }

  return { completed, score: bonusScore, message }
}

// Сохранить результат
export async function saveChallengeResult(
  challengeId: string,
  timeSeconds: number,
  hintsUsed: number,
  undosUsed: number,
  score: number
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('challenge_completions').upsert({
    user_id: user.id,
    challenge_id: challengeId,
    time_seconds: timeSeconds,
    hints_used: hintsUsed,
    undos_used: undosUsed,
    score,
    completed_at: new Date().toISOString(),
  })
}

// Получить статус сегодняшнего задания
export async function getTodayChallengeStatus(): Promise<ChallengeResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { completed: false }

  const challenge = await getTodayChallenge()
  if (!challenge.id) return { completed: false }

  const { data } = await supabase
    .from('challenge_completions')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_id', challenge.id)
    .single()

  if (data) {
    return {
      completed: true,
      timeSeconds: data.time_seconds,
      hintsUsed: data.hints_used,
      undosUsed: data.undos_used,
      score: data.score,
    }
  }

  return { completed: false }
}