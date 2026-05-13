// src/lib/engine/tileData.ts

export interface TileAppearance {
  symbol: string      // Основной символ
  label: string       // Подпись снизу
  color: string       // Цвет масти
}

// Данные для отображения каждой масти и значения
const bambooSymbols: Record<number, string> = {
  1: '🎐', 2: '🎋', 3: '🎍', 4: '🎋', 5: '🎍',
  6: '🎋', 7: '🎍', 8: '🎋', 9: '🎍'
}

const characterSymbols: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
  6: '六', 7: '七', 8: '八', 9: '九'
}

const dotsSymbols: Record<number, string> = {
  1: '🀙', 2: '🀚', 3: '🀛', 4: '🀜', 5: '🀝',
  6: '🀞', 7: '🀟', 8: '🀠', 9: '🀡'
}

export function getTileAppearance(suit: string, value: number | string): TileAppearance {
  const numValue = typeof value === 'string' ? 0 : value

  switch (suit) {
    case 'bamboo':
      return {
        symbol: bambooSymbols[numValue] || '🎋',
        label: `${numValue}索`,
        color: '#2d5a27'  // Зелёный
      }
    case 'characters':
      return {
        symbol: characterSymbols[numValue] || value.toString(),
        label: `${numValue}萬`,
        color: '#c41e3a'  // Красный
      }
    case 'dots':
      return {
        symbol: dotsSymbols[numValue] || '●',
        label: `${numValue}筒`,
        color: '#1e3a8a'  // Синий
      }
    case 'winds':
  const windNames: Record<string, string> = {
    east: '東', south: '南', west: '西', north: '北'
  }
  const windSymbol = windNames[String(value)] || '風'
  return {
    symbol: windSymbol,
    label: windSymbol,
    color: '#4a1d96'
  }
case 'dragons':
  const dragonNames: Record<string, string> = {
    red: '🀄', green: '🀅', white: '🀆'
  }
  const dragonSymbol = dragonNames[String(value)] || '🀄'
  return {
    symbol: dragonSymbol,
    label: '龍',
    color: '#b45309'
  }
    
    default:
      return {
        symbol: String(value),
        label: suit,
        color: '#6b7280'
      }
  }
}

// Фоны для разных мастей (CSS классы)
export const suitBackgrounds: Record<string, string> = {
  bamboo: 'bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 dark:from-amber-900 dark:via-amber-800 dark:to-amber-700',
  characters: 'bg-gradient-to-b from-red-50 via-red-100 to-red-200 dark:from-red-900 dark:via-red-800 dark:to-red-700',
  dots: 'bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700',
  winds: 'bg-gradient-to-b from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900 dark:via-purple-800 dark:to-purple-700',
  dragons: 'bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700',
}

export const suitBorders: Record<string, string> = {
  bamboo: 'border-amber-600 dark:border-amber-400',
  characters: 'border-red-600 dark:border-red-400',
  dots: 'border-blue-600 dark:border-blue-400',
  winds: 'border-purple-600 dark:border-purple-400',
  dragons: 'border-yellow-600 dark:border-yellow-400',
}
// Скины для тайлов
export const skinTileStyles: Record<string, { bg: string; border: string; textColor: string }> = {
  'Классический': {
    bg: 'bg-gradient-to-b from-amber-50 to-amber-200',
    border: 'border-amber-400',
    textColor: '#8b4513',
  },
  'Нефрит': {
    bg: 'bg-gradient-to-b from-emerald-100 to-green-300',
    border: 'border-emerald-500',
    textColor: '#064e3b',
  },
  'Сакура': {
    bg: 'bg-gradient-to-b from-pink-100 to-pink-300',
    border: 'border-pink-400',
    textColor: '#831843',
  },
  'Киберпанк': {
    bg: 'bg-gradient-to-b from-purple-200 to-cyan-200',
    border: 'border-purple-400',
    textColor: '#4c1d95',
  },
  'Золотой дракон': {
    bg: 'bg-gradient-to-b from-yellow-100 to-amber-400',
    border: 'border-yellow-500',
    textColor: '#78350f',
  },
}

// Скины для поля
export const skinBoardStyles: Record<string, { bg: string; border: string }> = {
  'Тёмное сукно': {
    bg: 'bg-gradient-to-b from-gray-800 via-gray-900 to-black',
    border: 'border-gray-600',
  },
  'Бамбуковый стол': {
    bg: 'bg-gradient-to-b from-amber-100 via-yellow-50 to-amber-200',
    border: 'border-amber-500',
  },
}