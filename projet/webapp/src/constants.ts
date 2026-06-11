export const SR = 22050
export const DURATION = 4.0
export const TARGET_LENGTH = Math.floor(SR * DURATION) // 88200
export const N_MELS = 128
export const HOP_LENGTH = 512
export const N_FFT = 2048
export const N_FRAMES = Math.floor(TARGET_LENGTH / HOP_LENGTH) + 1 // 173

export const CLASS_NAMES = [
  'air_conditioner',
  'car_horn',
  'children_playing',
  'dog_bark',
  'drilling',
  'engine_idling',
  'gun_shot',
  'jackhammer',
  'siren',
  'street_music',
] as const

export const CLASS_LABELS: Record<string, string> = {
  air_conditioner: 'Air Conditioner',
  car_horn: 'Car Horn',
  children_playing: 'Children Playing',
  dog_bark: 'Dog Bark',
  drilling: 'Drilling',
  engine_idling: 'Engine Idling',
  gun_shot: 'Gun Shot',
  jackhammer: 'Jackhammer',
  siren: 'Siren',
  street_music: 'Street Music',
}

export const CLASS_EMOJIS: Record<string, string> = {
  air_conditioner: '❄️',
  car_horn: '📯',
  children_playing: '🧒',
  dog_bark: '🐕',
  drilling: '🔩',
  engine_idling: '🚗',
  gun_shot: '💥',
  jackhammer: '🔨',
  siren: '🚨',
  street_music: '🎸',
}

export const MODELS = {
  cnn: {
    id: 'cnn',
    label: 'CNN (from scratch)',
    description: 'Réseau convolutif entraîné depuis zéro — 71% accuracy',
    path: '/models/cnn_urban_sound_8k.onnx',
    inputName: 'spectrogram',
    outputName: 'logits',
    inputShape: [1, 1, 128, 173] as const,
  },
  resnet18: {
    id: 'resnet18',
    label: 'ResNet18 (transfer learning)',
    description: 'ResNet18 pré-entraîné ImageNet fine-tuné — 71% accuracy',
    path: '/models/resnet18_urban_sound_8k.onnx',
    inputName: 'spectrogram',
    outputName: 'logits',
    inputShape: [1, 3, 224, 224] as const,
  },
} as const

export type ModelId = keyof typeof MODELS

export const IMAGENET_MEAN = [0.485, 0.456, 0.406]
export const IMAGENET_STD = [0.229, 0.224, 0.225]
