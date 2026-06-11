import { ref } from 'vue'
import * as ort from 'onnxruntime-web/wasm'
import { MODELS } from '../constants'
import type { ModelId } from '../constants'

ort.env.wasm.numThreads = 1

function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits)
  const exps = logits.map(x => Math.exp(x - maxLogit))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(x => x / sum)
}

const sessions = new Map<string, ort.InferenceSession>()

export function useOnnxInference() {
  const loading = ref(false)
  const loadingProgress = ref('')
  const error = ref<string | null>(null)

  async function loadModel(modelId: ModelId): Promise<void> {
    if (sessions.has(modelId)) return

    loading.value = true
    loadingProgress.value = 'Chargement du modèle (~44 MB)...'
    error.value = null

    try {
      const modelPath = MODELS[modelId].path
      const dataPath = modelPath + '.data'

      // Fetch the .onnx.data file and pass it as externalData
      loadingProgress.value = 'Téléchargement des poids (~44 MB)...'
      const dataResponse = await fetch(dataPath)
      if (!dataResponse.ok) throw new Error(`Failed to fetch ${dataPath}: ${dataResponse.status}`)
      const dataBuffer = await dataResponse.arrayBuffer()

      // The key must match exactly the filename referenced inside the .onnx file
      const dataFilename = dataPath.split('/').pop()!

      loadingProgress.value = 'Initialisation du modèle...'
      const session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['wasm'],
        externalData: [
          {
            path: dataFilename,
            data: dataBuffer,
          },
        ],
      })
      sessions.set(modelId, session)
    } catch (e) {
      error.value = `Erreur lors du chargement du modèle : ${e}`
      throw e
    } finally {
      loading.value = false
      loadingProgress.value = ''
    }
  }

  async function runInference(
    modelId: ModelId,
    inputData: Float32Array,
    inputShape: number[],
  ): Promise<number[]> {
    const session = sessions.get(modelId)
    if (!session) throw new Error(`Model ${modelId} not loaded`)

    const model = MODELS[modelId]
    const tensor = new ort.Tensor('float32', inputData, inputShape)
    const results = await session.run({ [model.inputName]: tensor })
    const logits = Array.from(results[model.outputName].data as Float32Array)
    return softmax(logits)
  }

  return { loadModel, runInference, loading, loadingProgress, error }
}
