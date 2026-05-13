// src/lib/engine/GameEngine.ts
import { GameState, Tile, TileSuit, TileValue, Position, GameAction } from './types'

export class GameEngine {
  private state: GameState

  constructor(positions: Position[]) {
    this.state = this.initialize(positions)
  }

  private initialize(positions: Position[]): GameState {
    const tiles = this.generateTiles(positions)
    this.updateFreeTiles(tiles)
    
    return {
      tiles,
      selectedTileId: null,
      matchedPairs: 0,
      totalPairs: tiles.length / 2,
      hintsAvailable: 3,
      undosAvailable: 5,
      history: [],
      isGameOver: false,
      isWin: false,
      startTime: Date.now(),
    }
  }

  private generateTiles(positions: Position[]): Tile[] {
    const suits: TileSuit[] = ['bamboo', 'characters', 'dots', 'winds', 'dragons']
    const values: TileValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    
    const pairCount = Math.floor(positions.length / 2)
    
    // Сортируем позиции по слоям (верхние первые)
    const sortedPositions = [...positions].sort((a, b) => b.layer - a.layer)
    
    // Создаём тайлы с гарантированной решаемостью
    const tiles: Tile[] = []
    let tileIndex = 0
    
    for (let i = 0; i < pairCount; i++) {
      const suit = suits[Math.floor(Math.random() * suits.length)]
      const value = values[Math.floor(Math.random() * values.length)]
      
      // Берём две соседние позиции для пары
      const pos1 = sortedPositions[tileIndex]
      const pos2 = sortedPositions[tileIndex + 1]
      
      if (pos1 && pos2) {
        tiles.push({
          id: `tile-${tileIndex}`,
          suit,
          value,
          layer: pos1.layer,
          row: pos1.row,
          col: pos1.col,
          isFree: false,
          isRemoved: false,
        })
        tiles.push({
          id: `tile-${tileIndex + 1}`,
          suit,
          value,
          layer: pos2.layer,
          row: pos2.row,
          col: pos2.col,
          isFree: false,
          isRemoved: false,
        })
        tileIndex += 2
      }
    }
    
    return tiles
  }

  private isTileFree(tile: Tile, tiles: Tile[]): boolean {
    if (tile.isRemoved) return false

    // Проверяем, есть ли тайл сверху
    const hasTileAbove = tiles.some(t =>
      !t.isRemoved &&
      t.layer === tile.layer + 1 &&
      Math.abs(t.row - tile.row) < 1.5 &&
      Math.abs(t.col - tile.col) < 1.5
    )
    if (hasTileAbove) return false

    // Проверяем, свободна ли левая сторона
    const leftFree = !tiles.some(t =>
      !t.isRemoved &&
      t.layer === tile.layer &&
      t.row === tile.row &&
      t.col === tile.col - 1
    )

    // Проверяем, свободна ли правая сторона
    const rightFree = !tiles.some(t =>
      !t.isRemoved &&
      t.layer === tile.layer &&
      t.row === tile.row &&
      t.col === tile.col + 1
    )

    return leftFree || rightFree
  }

  private updateFreeTiles(tiles: Tile[]): void {
    tiles.forEach(tile => {
      if (!tile.isRemoved) {
        tile.isFree = this.isTileFree(tile, tiles)
      } else {
        tile.isFree = false
      }
    })
  }

  selectTile(tileId: string): GameState {
    const tile = this.state.tiles.find(t => t.id === tileId)
    
    if (!tile || tile.isRemoved || !tile.isFree) {
      return { ...this.state }
    }

    // Если тайл уже выбран — снимаем выделение
    if (this.state.selectedTileId === tileId) {
      this.state.selectedTileId = null
      return { ...this.state }
    }

    // Если нет выбранного тайла — выбираем
    if (!this.state.selectedTileId) {
      this.state.selectedTileId = tileId
      this.state.history.push({ type: 'SELECT', tileId })
      return { ...this.state }
    }

    // Проверяем совпадение
    const selectedTile = this.state.tiles.find(t => t.id === this.state.selectedTileId)
    
    if (selectedTile && selectedTile.suit === tile.suit && selectedTile.value === tile.value) {
      // Совпадение! Удаляем пару
      selectedTile.isRemoved = true
      tile.isRemoved = true
      this.state.matchedPairs++
      this.state.history.push({
        type: 'MATCH',
        tileIds: [selectedTile.id, tile.id]
      })

      // Проверяем победу
      if (this.state.matchedPairs === this.state.totalPairs) {
        this.state.isGameOver = true
        this.state.isWin = true
      }
    }

    this.state.selectedTileId = null
    this.updateFreeTiles(this.state.tiles)
    return { ...this.state }
  }

  getHint(): [string, string] | null {
    if (this.state.hintsAvailable <= 0) return null

    const freeTiles = this.state.tiles.filter(t => t.isFree && !t.isRemoved)
    
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].suit === freeTiles[j].suit &&
            freeTiles[i].value === freeTiles[j].value) {
          this.state.hintsAvailable--
          this.state.history.push({
            type: 'HINT',
            tileIds: [freeTiles[i].id, freeTiles[j].id]
          })
          return [freeTiles[i].id, freeTiles[j].id]
        }
      }
    }
    return null
  }

  undo(): boolean {
    if (this.state.undosAvailable <= 0 || this.state.history.length === 0) {
      return false
    }

    // Находим последний MATCH
    let lastMatchIndex = -1
    for (let i = this.state.history.length - 1; i >= 0; i--) {
      if (this.state.history[i].type === 'MATCH') {
        lastMatchIndex = i
        break
      }
    }

    if (lastMatchIndex === -1) return false

    const lastMatch = this.state.history[lastMatchIndex] as { type: 'MATCH'; tileIds: [string, string] }
    
    // Восстанавливаем тайлы
    lastMatch.tileIds.forEach(id => {
      const tile = this.state.tiles.find(t => t.id === id)
      if (tile) {
        tile.isRemoved = false
      }
    })

    this.state.matchedPairs--
    this.state.undosAvailable--
    this.state.selectedTileId = null
    this.state.history.push({
      type: 'UNDO',
      restoredTiles: lastMatch.tileIds
    })

    this.updateFreeTiles(this.state.tiles)
    return true
  }

  getState(): GameState {
    return { ...this.state }
  }

  getElapsedTime(): number {
    return Math.floor((Date.now() - this.state.startTime) / 1000)
  }
}