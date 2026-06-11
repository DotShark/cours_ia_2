export interface Prediction {
  className: string
  label: string
  emoji: string
  confidence: number
}

export type AppStatus =
  | 'idle'
  | 'loading_model'
  | 'processing'
  | 'done'
  | 'error'
