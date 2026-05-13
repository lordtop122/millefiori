// src/lib/ai/strategist.ts
import { Tile, GameState } from '@/lib/engine/types'

export interface StrategicAdvice {
  message: string
  priority: 'high' | 'medium' | 'low'
  type: 'danger' | 'opportunity' | 'tip' | 'warning'
}

export class AIStrategist {
  
  // Анализ текущей ситуации на поле
  analyze(state: GameState): StrategicAdvice | null {
    const activeTiles = state.tiles.filter(t => !t.isRemoved)
    const freeTiles = activeTiles.filter(t => t.isFree)
    
    // 1. Проверка на тупик
    if (freeTiles.length === 0 && !state.isWin) {
      return {
        message: '⚠️ Тупик! Срочно используй отмену (↩️). Текущий путь ведёт в никуда.',
        priority: 'high',
        type: 'danger',
      }
    }

    // 2. Осталось мало ходов
    if (freeTiles.length <= 2 && !state.isWin) {
      return {
        message: '🔴 Осталось всего пара доступных ходов. Используй отмену чтобы открыть больше вариантов!',
        priority: 'high',
        type: 'warning',
      }
    }

    // 3. Анализ верхних слоёв
    const topLayerAdvice = this.analyzeTopLayers(state)
    if (topLayerAdvice) return topLayerAdvice

    // 4. Поиск редких пар
    const rarePairAdvice = this.findRarePairs(state)
    if (rarePairAdvice) return rarePairAdvice

    // 5. Почти победа
    const remainingPairs = state.totalPairs - state.matchedPairs
    if (remainingPairs <= 3 && remainingPairs > 0) {
      return {
        message: `🌟 Осталось всего ${remainingPairs} пары! Будь внимателен — каждый ход на вес золота.`,
        priority: 'medium',
        type: 'opportunity',
      }
    }

    // 6. Общий стратегический совет (раз в несколько ходов)
    if (Math.random() < 0.15) {
      return this.getGeneralStrategy(state)
    }

    return null
  }

  // Анализ верхних слоёв
  private analyzeTopLayers(state: GameState): StrategicAdvice | null {
    const maxLayer = Math.max(...state.tiles.filter(t => !t.isRemoved).map(t => t.layer))
    const topTiles = state.tiles.filter(t => !t.isRemoved && t.layer === maxLayer)
    
    if (topTiles.length > 3) {
      const topPairs = this.findPairs(topTiles)
      if (topPairs.length > 0) {
        return {
          message: `🗻 На верхнем слое ${topTiles.length} тайлов. Разбери сначала их — это откроет больше ходов внизу!`,
          priority: 'medium',
          type: 'tip',
        }
      }
    }

    // Проверяем заблокированные тайлы
    const blockedCount = state.tiles.filter(t => !t.isRemoved && !t.isFree).length
    if (blockedCount > state.totalPairs) {
      return {
        message: '🔒 Много заблокированных тайлов. Сфокусируйся на освобождении верхних слоёв!',
        priority: 'medium',
        type: 'tip',
      }
    }

    return null
  }

  // Поиск редких пар (которых мало на поле)
  private findRarePairs(state: GameState): StrategicAdvice | null {
    const activeTiles = state.tiles.filter(t => !t.isRemoved)
    
    // Считаем количество каждого типа тайлов
    const typeCount: Record<string, { count: number; tiles: Tile[] }> = {}
    
    activeTiles.forEach(tile => {
      const key = `${tile.suit}-${tile.value}`
      if (!typeCount[key]) {
        typeCount[key] = { count: 0, tiles: [] }
      }
      typeCount[key].count++
      typeCount[key].tiles.push(tile)
    })

    // Находим типы с 2 тайлами (последняя пара этого типа)
    const lastPairs = Object.entries(typeCount).filter(([_, data]) => data.count === 2)
    
    if (lastPairs.length > 0 && lastPairs.length <= 3) {
      const pairNames = lastPairs.map(([key]) => key.split('-')[1]).join(', ')
      return {
        message: `🎯 На поле остались уникальные тайлы: ${pairNames}. Не упусти их — другой пары не будет!`,
        priority: 'high',
        type: 'opportunity',
      }
    }

    return null
  }

  // Находит доступные пары среди тайлов
  private findPairs(tiles: Tile[]): [Tile, Tile][] {
    const pairs: [Tile, Tile][] = []
    const free = tiles.filter(t => t.isFree)
    
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i].suit === free[j].suit && free[i].value === free[j].value) {
          pairs.push([free[i], free[j]])
        }
      }
    }
    
    return pairs
  }

  // Общий стратегический совет
  private getGeneralStrategy(state: GameState): StrategicAdvice {
    const tips = [
      {
        message: '🧘 Медитативный совет: не спеши. Пауза в 10 секунд помогает увидеть скрытые пары.',
        priority: 'low' as const,
        type: 'tip' as const,
      },
      {
        message: '👁️ Смотри на 2-3 хода вперёд. Прежде чем убрать пару, подумай — какие тайлы она откроет?',
        priority: 'low' as const,
        type: 'tip' as const,
      },
      {
        message: '🎯 Приоритет: сначала убирай тайлы, которых на поле МНОГО. Редкие оставь на потом.',
        priority: 'low' as const,
        type: 'tip' as const,
      },
      {
        message: '🏗️ Работай слоями: снизу вверх. Каждый убранный верхний тайл — +2 новых хода внизу.',
        priority: 'low' as const,
        type: 'tip' as const,
      },
      {
        message: '💡 Если сомневаешься между двумя парами — выбери ту, где тайлы на РАЗНЫХ сторонах поля. Это сохранит баланс.',
        priority: 'low' as const,
        type: 'tip' as const,
      },
    ]
    
    return tips[Math.floor(Math.random() * tips.length)]
  }
}