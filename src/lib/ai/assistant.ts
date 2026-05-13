// src/lib/ai/assistant.ts
import { getRandomMessage, getTutorialSteps, findBestAnswer } from './knowledge'
import { AIStrategist } from './strategist'

export type AssistantMode = 'idle' | 'tutorial' | 'playing'

export interface ChatMessage {
  from: 'user' | 'sensei'
  text: string
  timestamp: number
}

export interface AssistantState {
  mode: AssistantMode
  isVisible: boolean
  isMinimized: boolean
  tutorialStep: number
  hasSeenTutorial: boolean
  messages: ChatMessage[]
}

export class SenseiAssistant {
  state: AssistantState
  private lastTipTime: number = 0
  private moveCount: number = 0
  private strategist: AIStrategist

  constructor() {
    this.strategist = new AIStrategist()
    
    const seenTutorial = typeof window !== 'undefined' && 
      localStorage.getItem('millefiori_tutorial_seen') === 'true'

    this.state = {
      mode: seenTutorial ? 'playing' : 'tutorial',
      isVisible: !seenTutorial,
      isMinimized: seenTutorial,
      tutorialStep: 0,
      hasSeenTutorial: seenTutorial,
      messages: [],
    }

    if (!seenTutorial) {
      this.startTutorial()
    }
  }

  startTutorial(): string {
    const steps = getTutorialSteps()
    this.state.mode = 'tutorial'
    this.state.tutorialStep = 0
    this.state.isVisible = true
    this.state.isMinimized = false
    const msg = steps[0].text
    this.state.messages = [{ from: 'sensei', text: msg, timestamp: Date.now() }]
    return msg
  }

  nextTutorialStep(): string | null {
    const steps = getTutorialSteps()
    this.state.tutorialStep++
    
    if (this.state.tutorialStep >= steps.length) {
      this.finishTutorial()
      return null
    }
    
    const msg = steps[this.state.tutorialStep].text
    this.state.messages.push({ from: 'sensei', text: msg, timestamp: Date.now() })
    return msg
  }

  finishTutorial(): void {
    this.state.mode = 'playing'
    this.state.hasSeenTutorial = true
    this.state.isMinimized = true
    const msg = '🎉 Ты готов играть! Я всегда рядом — нажми 🤖 чтобы спросить совет.'
    this.state.messages.push({ from: 'sensei', text: msg, timestamp: Date.now() })
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('millefiori_tutorial_seen', 'true')
    }
  }

  skipTutorial(): void {
    this.state.mode = 'playing'
    this.state.hasSeenTutorial = true
    this.state.isMinimized = true
    this.state.messages = []
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('millefiori_tutorial_seen', 'true')
    }
  }

  toggle(): void {
    this.state.isMinimized = !this.state.isMinimized
    if (!this.state.isMinimized) {
      this.state.isVisible = true
    }
  }

  reply(userMessage: string): string {
    this.state.messages.push({ from: 'user', text: userMessage, timestamp: Date.now() })
    
    const answer = findBestAnswer(userMessage)
    this.state.messages.push({ from: 'sensei', text: answer, timestamp: Date.now() })
    
    return answer
  }

  update(
    state: any,
    forceAnalysis: boolean = false
  ): string | null {
    
    if (state.isWin) {
      const msg = '🏆 Поздравляю с победой! Не забудь сохранить рекорд!'
      this.state.messages.push({ from: 'sensei', text: msg, timestamp: Date.now() })
      return msg
    }

    const freeTiles = state.tiles.filter((t: any) => t.isFree && !t.isRemoved).length

    if (freeTiles === 0 && state.matchedPairs < state.totalPairs) {
      const msg = '😔 Ходов нет! Используй ↩️ отмену чтобы вернуться и попробовать другой путь.'
      this.state.messages.push({ from: 'sensei', text: msg, timestamp: Date.now() })
      return msg
    }

    this.moveCount++
    if (forceAnalysis || this.moveCount % 8 === 0 || freeTiles <= 4) {
      const analysis = this.strategist.analyze(state)
      if (analysis && (analysis.priority === 'high' || Math.random() < 0.4)) {
        this.state.messages.push({ from: 'sensei', text: analysis.message, timestamp: Date.now() })
        return analysis.message
      }
    }

    return null
  }

  hide(): void {
    this.state.isMinimized = true
  }

  getState(): AssistantState {
    return { ...this.state }
  }
}