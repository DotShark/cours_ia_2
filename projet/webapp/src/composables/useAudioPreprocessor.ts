import { computeMelSpectrogram } from '../lib/melspectrogram'
import { N_MELS, N_FRAMES, IMAGENET_MEAN, IMAGENET_STD } from '../constants'
import type { ModelId } from '../constants'

function bilinearResize(
  src: Float32Array,
  srcH: number,
  srcW: number,
  dstH: number,
  dstW: number,
): Float32Array {
  const dst = new Float32Array(dstH * dstW)
  const scaleH = srcH / dstH
  const scaleW = srcW / dstW

  for (let y = 0; y < dstH; y++) {
    const srcY = (y + 0.5) * scaleH - 0.5
    const y0 = Math.max(0, Math.floor(srcY))
    const y1 = Math.min(srcH - 1, y0 + 1)
    const dy = srcY - y0

    for (let x = 0; x < dstW; x++) {
      const srcX = (x + 0.5) * scaleW - 0.5
      const x0 = Math.max(0, Math.floor(srcX))
      const x1 = Math.min(srcW - 1, x0 + 1)
      const dx = srcX - x0

      const v00 = src[y0 * srcW + x0]
      const v01 = src[y0 * srcW + x1]
      const v10 = src[y1 * srcW + x0]
      const v11 = src[y1 * srcW + x1]

      dst[y * dstW + x] =
        v00 * (1 - dy) * (1 - dx) +
        v01 * (1 - dy) * dx +
        v10 * dy * (1 - dx) +
        v11 * dy * dx
    }
  }

  return dst
}

// Normalize mel spectrogram values from [-80, 0] dB to [0, 1] for ImageNet
function dbToUnit(melDb: Float32Array): Float32Array {
  const out = new Float32Array(melDb.length)
  for (let i = 0; i < melDb.length; i++) {
    // Map [-80, 0] → [0, 1]
    out[i] = (melDb[i] + 80) / 80
  }
  return out
}

export async function preprocessForModel(
  file: File,
  modelId: ModelId,
): Promise<{ data: Float32Array; shape: number[] }> {
  const melDb = await computeMelSpectrogram(file) // (N_MELS * N_FRAMES,)

  if (modelId === 'cnn') {
    // Shape: (1, 1, 128, 173)
    return { data: melDb, shape: [1, 1, N_MELS, N_FRAMES] }
  }

  // ResNet18: (1, 3, 224, 224)
  const TARGET_SIZE = 224

  // Normalize to [0, 1] before ImageNet normalization
  const unitMel = dbToUnit(melDb)

  // Resize (128, 173) → (224, 224)
  const resized = bilinearResize(unitMel, N_MELS, N_FRAMES, TARGET_SIZE, TARGET_SIZE)

  // Replicate to 3 channels and apply ImageNet normalization
  const out = new Float32Array(3 * TARGET_SIZE * TARGET_SIZE)
  for (let c = 0; c < 3; c++) {
    const mean = IMAGENET_MEAN[c]
    const std = IMAGENET_STD[c]
    for (let i = 0; i < TARGET_SIZE * TARGET_SIZE; i++) {
      out[c * TARGET_SIZE * TARGET_SIZE + i] = (resized[i] - mean) / std
    }
  }

  return { data: out, shape: [1, 3, TARGET_SIZE, TARGET_SIZE] }
}
