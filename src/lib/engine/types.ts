// src/lib/engine/types.ts

export type TileSuit = 'bamboo' | 'characters' | 'dots' | 'winds' | 'dragons'

export type TileValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'north' | 'south' | 'east' | 'west' | 'red' | 'green' | 'white'

export interface Tile {
  id: string
  suit: TileSuit
  value: TileValue
  layer: number
  row: number
  col: number
  isFree: boolean
  isRemoved: boolean
}

export interface Position {
  layer: number
  row: number
  col: number
}

export interface GameState {
  tiles: Tile[]
  selectedTileId: string | null
  matchedPairs: number
  totalPairs: number
  hintsAvailable: number
  undosAvailable: number
  history: GameAction[]
  isGameOver: boolean
  isWin: boolean
  startTime: number
}

export type GameAction =
  | { type: 'SELECT'; tileId: string }
  | { type: 'MATCH'; tileIds: [string, string] }
  | { type: 'HINT'; tileIds: [string, string] }
  | { type: 'UNDO'; restoredTiles: string[] }