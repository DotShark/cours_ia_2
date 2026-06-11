import { SR, TARGET_LENGTH, N_MELS, HOP_LENGTH, N_FFT, N_FRAMES } from '../constants'

// ─── Hann window ────────────────────────────────────────────────────────────

function makeHannWindow(size: number): Float32Array {
  const w = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)))
  }
  return w
}

// ─── FFT (Cooley-Tukey radix-2, in-place) ───────────────────────────────────

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length
  // Bit-reversal permutation
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  // Butterfly operations
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wRe = Math.cos(ang)
    const wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let curRe = 1.0
      let curIm = 0.0
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k]
        const uIm = im[i + k]
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe
        re[i + k] = uRe + vRe
        im[i + k] = uIm + vIm
        re[i + k + len / 2] = uRe - vRe
        im[i + k + len / 2] = uIm - vIm
        const newCurRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe
        curRe = newCurRe
      }
    }
  }
}

// ─── Mel scale (Slaney / librosa default) ───────────────────────────────────

const F_SP = 200.0 / 3.0
const MIN_LOG_HZ = 1000.0
const MIN_LOG_MEL = MIN_LOG_HZ / F_SP
const LOGSTEP = Math.log(6.4) / 27.0

function hzToMel(hz: number): number {
  if (hz < MIN_LOG_HZ) return hz / F_SP
  return MIN_LOG_MEL + Math.log(hz / MIN_LOG_HZ) / LOGSTEP
}

function melToHz(mel: number): number {
  if (mel < MIN_LOG_MEL) return F_SP * mel
  return MIN_LOG_HZ * Math.exp(LOGSTEP * (mel - MIN_LOG_MEL))
}

// ─── Mel filterbank (Slaney-normalized, matches librosa defaults) ────────────

function buildMelFilterbank(nMels: number, nFft: number, sr: number): Float64Array[] {
  const nFreqs = nFft / 2 + 1 // 1025
  const fMin = 0.0
  const fMax = sr / 2.0

  const melMin = hzToMel(fMin)
  const melMax = hzToMel(fMax)

  // nMels + 2 evenly spaced mel points
  const melPoints = new Float64Array(nMels + 2)
  for (let i = 0; i < nMels + 2; i++) {
    melPoints[i] = melMin + (i / (nMels + 1)) * (melMax - melMin)
  }

  // Convert back to Hz then to FFT bin indices
  const hzPoints = melPoints.map(m => melToHz(m))
  const binPoints = hzPoints.map(hz => Math.floor((nFft + 1) * hz / sr))

  // Build triangular filters with Slaney norm
  const filters: Float64Array[] = []
  for (let m = 0; m < nMels; m++) {
    const filter = new Float64Array(nFreqs)
    const fLow = hzPoints[m]
    const fCenter = hzPoints[m + 1]
    const fHigh = hzPoints[m + 2]

    // Slaney normalization factor: 2 / (f_high - f_low)
    const norm = 2.0 / (fHigh - fLow)

    for (let k = 0; k < nFreqs; k++) {
      const hz = k * sr / nFft
      if (hz >= fLow && hz <= fCenter) {
        filter[k] = norm * (hz - fLow) / (fCenter - fLow)
      } else if (hz > fCenter && hz <= fHigh) {
        filter[k] = norm * (fHigh - hz) / (fHigh - fCenter)
      }
    }

    // Alternatively build from bin indices (matches librosa more exactly)
    // Reset and use bin-based approach
    filter.fill(0)
    const bLow = binPoints[m]
    const bCenter = binPoints[m + 1]
    const bHigh = binPoints[m + 2]
    for (let k = bLow; k < bCenter; k++) {
      if (k < nFreqs) filter[k] = (k - bLow) / (bCenter - bLow)
    }
    for (let k = bCenter; k <= bHigh; k++) {
      if (k < nFreqs) filter[k] = (bHigh - k) / (bHigh - bCenter)
    }
    // Apply Slaney normalization
    for (let k = 0; k < nFreqs; k++) {
      filter[k] *= norm
    }

    filters.push(filter)
  }

  return filters
}

// ─── Reflect padding (librosa center=True) ──────────────────────────────────

function reflectPad(signal: Float32Array, padLen: number): Float32Array {
  const out = new Float32Array(signal.length + 2 * padLen)
  // Left: reflect (reversed, excluding index 0)
  for (let i = 0; i < padLen; i++) {
    out[padLen - 1 - i] = signal[i + 1]
  }
  // Center
  out.set(signal, padLen)
  // Right: reflect (reversed from end, excluding last sample)
  for (let i = 0; i < padLen; i++) {
    out[padLen + signal.length + i] = signal[signal.length - 2 - i]
  }
  return out
}

// ─── STFT → power spectrogram ────────────────────────────────────────────────

function computePowerSpectrogram(
  signal: Float32Array,
  nFft: number,
  hopLength: number,
): Float64Array[] {
  const window = makeHannWindow(nFft)
  const nFreqs = nFft / 2 + 1
  const paddedSignal = reflectPad(signal, nFft / 2)
  const nFrames = Math.floor((paddedSignal.length - nFft) / hopLength) + 1

  const powerSpec: Float64Array[] = Array.from({ length: nFreqs }, () => new Float64Array(nFrames))

  const re = new Float64Array(nFft)
  const im = new Float64Array(nFft)

  for (let t = 0; t < nFrames; t++) {
    const offset = t * hopLength
    re.fill(0)
    im.fill(0)
    for (let i = 0; i < nFft; i++) {
      re[i] = paddedSignal[offset + i] * window[i]
    }
    fft(re, im)
    for (let k = 0; k < nFreqs; k++) {
      powerSpec[k][t] = re[k] * re[k] + im[k] * im[k]
    }
  }

  return powerSpec
}

// ─── Apply mel filterbank ────────────────────────────────────────────────────

function applyMelFilters(
  powerSpec: Float64Array[],
  filters: Float64Array[],
  nFrames: number,
): Float64Array[] {
  const nMels = filters.length
  const nFreqs = powerSpec.length
  const melSpec: Float64Array[] = Array.from({ length: nMels }, () => new Float64Array(nFrames))

  for (let m = 0; m < nMels; m++) {
    for (let t = 0; t < nFrames; t++) {
      let val = 0
      for (let k = 0; k < nFreqs; k++) {
        val += filters[m][k] * powerSpec[k][t]
      }
      melSpec[m][t] = val
    }
  }

  return melSpec
}

// ─── power_to_db (librosa: ref=max, top_db=80) ──────────────────────────────

function powerToDb(melSpec: Float64Array[], nMels: number, nFrames: number): Float32Array {
  let maxVal = -Infinity
  for (let m = 0; m < nMels; m++) {
    for (let t = 0; t < nFrames; t++) {
      if (melSpec[m][t] > maxVal) maxVal = melSpec[m][t]
    }
  }
  const refVal = Math.max(maxVal, 1e-10)

  const out = new Float32Array(nMels * nFrames)
  for (let m = 0; m < nMels; m++) {
    for (let t = 0; t < nFrames; t++) {
      const db = 10 * Math.log10(Math.max(melSpec[m][t], 1e-10) / refVal)
      out[m * nFrames + t] = Math.max(db, -80)
    }
  }
  return out
}

// ─── Audio decoding + resampling ─────────────────────────────────────────────

async function decodeAndResample(file: File): Promise<Float32Array> {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new AudioContext()

  let decoded: AudioBuffer
  try {
    decoded = await audioCtx.decodeAudioData(arrayBuffer)
  } finally {
    audioCtx.close()
  }

  // Mix to mono
  let mono: Float32Array
  if (decoded.numberOfChannels === 1) {
    mono = decoded.getChannelData(0).slice()
  } else {
    mono = new Float32Array(decoded.length)
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const chData = decoded.getChannelData(ch)
      for (let i = 0; i < decoded.length; i++) mono[i] += chData[i]
    }
    const n = decoded.numberOfChannels
    for (let i = 0; i < mono.length; i++) mono[i] /= n
  }

  // Resample to target SR if needed
  if (decoded.sampleRate === SR) return mono

  const ratio = SR / decoded.sampleRate
  const outLength = Math.round(mono.length * ratio)
  const offlineCtx = new OfflineAudioContext(1, outLength, SR)
  const buffer = offlineCtx.createBuffer(1, mono.length, decoded.sampleRate)
  buffer.copyToChannel(mono, 0)
  const source = offlineCtx.createBufferSource()
  source.buffer = buffer
  source.connect(offlineCtx.destination)
  source.start()
  const resampled = await offlineCtx.startRendering()
  return resampled.getChannelData(0).slice()
}

// ─── Pad or trim to target length ────────────────────────────────────────────

function padOrTrim(signal: Float32Array, targetLen: number): Float32Array {
  if (signal.length >= targetLen) return signal.slice(0, targetLen)
  const out = new Float32Array(targetLen)
  out.set(signal)
  return out
}

// ─── Cached mel filterbank ───────────────────────────────────────────────────

let cachedFilters: Float64Array[] | null = null

function getMelFilters(): Float64Array[] {
  if (!cachedFilters) {
    cachedFilters = buildMelFilterbank(N_MELS, N_FFT, SR)
  }
  return cachedFilters
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute mel spectrogram matching librosa's default pipeline.
 * Returns flat Float32Array of shape (N_MELS * N_FRAMES,) = (128 * 173,) in row-major order.
 */
export async function computeMelSpectrogram(file: File): Promise<Float32Array> {
  const rawAudio = await decodeAndResample(file)
  const trimmed = padOrTrim(rawAudio, TARGET_LENGTH)
  const filters = getMelFilters()
  const powerSpec = computePowerSpectrogram(trimmed, N_FFT, HOP_LENGTH)
  const actualFrames = powerSpec[0].length
  const frames = Math.min(actualFrames, N_FRAMES)
  const melSpec = applyMelFilters(powerSpec, filters, frames)
  return powerToDb(melSpec, N_MELS, frames)
}
