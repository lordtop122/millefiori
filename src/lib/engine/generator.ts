// src/lib/engine/generator.ts
import { Position } from './types'

export class LayoutGenerator {
  static generateTurtle(): Position[] {
    const positions: Position[] = []
    
    // Слой 0: основание 8x8
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        positions.push({ layer: 0, row, col })
      }
    }
    
    // Слой 1: 7x7
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        positions.push({ layer: 1, row, col })
      }
    }
    
    // Слой 2: 5x5
    for (let row = 1; row < 6; row++) {
      for (let col = 1; col < 6; col++) {
        positions.push({ layer: 2, row, col })
      }
    }
    
    // Слой 3: 3x3
    for (let row = 2; row < 5; row++) {
      for (let col = 2; col < 5; col++) {
        positions.push({ layer: 3, row, col })
      }
    }

    return positions
  }

  static generateFromSeed(seed: number, difficulty: string): Position[] {
    const baseLayout = this.generateTurtle()
    
    const removeByDifficulty: Record<string, number> = {
      easy: 10,
      medium: 20,
      hard: 30,
      master: 40
    }
    
    const removeCount = removeByDifficulty[difficulty] || 20
    const keepCount = Math.max(baseLayout.length - removeCount, 20)
    
    let currentSeed = seed
    const shuffled = [...baseLayout].sort(() => {
      const x = Math.sin(currentSeed++) * 10000
      return x - Math.floor(x)
    })
    
    return shuffled.slice(0, keepCount)
  }
}