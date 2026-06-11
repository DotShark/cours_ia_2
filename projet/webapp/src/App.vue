<template>
  <div class="app">
    <header class="app-header">
      <h1>Urban Sound Classifier</h1>
      <p class="app-subtitle">Classificateur de sons urbains — UrbanSound8K</p>
    </header>

    <main class="app-main">
      <ModelSelector @model-changed="onModelChanged" />
      <DropZone @file-selected="onFileSelected" />

      <button
        v-if="audioFile && status !== 'loading_model' && status !== 'processing'"
        class="btn-classify"
        @click="classify"
      >
        Classifier
      </button>

      <div v-if="status === 'loading_model'" class="status-msg">
        <span class="spinner" /> {{ loadingProgress || 'Chargement du modèle (~44 MB)...' }}
      </div>

      <div v-if="status === 'processing'" class="status-msg">
        <span class="spinner" /> Analyse audio en cours...
      </div>

      <div v-if="status === 'error'" class="status-error">
        {{ errorMsg }}
      </div>

      <ResultsDisplay v-if="status === 'done' && predictions.length" :predictions="predictions" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModelSelector from './components/ModelSelector.vue'
import DropZone from './components/DropZone.vue'
import ResultsDisplay from './components/ResultsDisplay.vue'
import { useOnnxInference } from './composables/useOnnxInference.ts'
import { preprocessForModel } from './composables/useAudioPreprocessor.ts'
import { CLASS_NAMES, CLASS_LABELS, CLASS_EMOJIS } from './constants.ts'
import type { ModelId } from './constants.ts'
import type { Prediction, AppStatus } from './types.ts'

const { loadModel, runInference, loadingProgress } = useOnnxInference()

const audioFile = ref<File | null>(null)
const selectedModel = ref<ModelId>('cnn')
const status = ref<AppStatus>('idle')
const predictions = ref<Prediction[]>([])
const errorMsg = ref('')

function onModelChanged(id: ModelId) {
  selectedModel.value = id
}

function onFileSelected(file: File) {
  audioFile.value = file
  status.value = 'idle'
  predictions.value = []
}

async function classify() {
  if (!audioFile.value) return

  try {
    status.value = 'loading_model'
    await loadModel(selectedModel.value)

    status.value = 'processing'
    const { data, shape } = await preprocessForModel(audioFile.value, selectedModel.value)
    const probabilities = await runInference(selectedModel.value, data, shape)

    predictions.value = CLASS_NAMES.map((name, i) => ({
      className: name,
      label: CLASS_LABELS[name],
      emoji: CLASS_EMOJIS[name],
      confidence: probabilities[i],
    }))
    status.value = 'done'
  } catch (e) {
    errorMsg.value = String(e)
    status.value = 'error'
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #020817;
  color: #e2e8f0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

#app {
  display: flex;
  justify-content: center;
  padding: 40px 16px 80px;
}
</style>

<style scoped>
.app {
  width: 100%;
  max-width: 600px;
}

.app-header {
  margin-bottom: 32px;
  text-align: center;
}

.app-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 0.85rem;
  color: #475569;
  margin-top: 6px;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-classify {
  width: 100%;
  padding: 14px;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-classify:hover {
  background: #0f766e;
}

.status-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 0.9rem;
  justify-content: center;
  padding: 12px 0;
}

.status-error {
  background: #1a0a0a;
  border: 1px solid #7f1d1d;
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #334155;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
