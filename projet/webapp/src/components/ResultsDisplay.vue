<template>
  <div class="results">
    <div class="hero">
      <div class="hero-emoji">{{ top.emoji }}</div>
      <div class="hero-info">
        <div class="hero-label">{{ top.label }}</div>
        <div class="hero-confidence">{{ (top.confidence * 100).toFixed(1) }}% de certitude</div>
      </div>
    </div>

    <div class="bars">
      <ConfidenceBar
        v-for="p in sorted"
        :key="p.className"
        :label="p.label"
        :emoji="p.emoji"
        :confidence="p.confidence"
        :isTop="p.className === top.className"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfidenceBar from './ConfidenceBar.vue'
import type { Prediction } from '../types.ts'

const props = defineProps<{
  predictions: Prediction[]
}>()

const sorted = computed(() =>
  [...props.predictions].sort((a, b) => b.confidence - a.confidence),
)

const top = computed(() => sorted.value[0])
</script>

<style scoped>
.results {
  margin-top: 24px;
}

.hero {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #0f172a;
  border: 1px solid #0d9488;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.hero-emoji {
  font-size: 2.8rem;
  line-height: 1;
}

.hero-label {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f1f5f9;
}

.hero-confidence {
  font-size: 0.95rem;
  color: #0d9488;
  margin-top: 4px;
}

.bars {
  display: flex;
  flex-direction: column;
}
</style>
