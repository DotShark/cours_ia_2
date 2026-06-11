<template>
  <div class="bar-row" :class="{ 'bar-row--top': isTop }">
    <div class="bar-left">
      <span class="bar-emoji">{{ emoji }}</span>
      <span class="bar-label">{{ label }}</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" :style="{ width: pct + '%' }" />
    </div>
    <span class="bar-pct">{{ pct.toFixed(1) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  emoji: string
  confidence: number
  isTop: boolean
}>()

const pct = computed(() => props.confidence * 100)
</script>

<style scoped>
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 200px;
  flex-shrink: 0;
}

.bar-emoji {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.bar-label {
  font-size: 0.85rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-row--top .bar-label {
  color: #e2e8f0;
  font-weight: 600;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #1e293b;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #475569;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.bar-row--top .bar-fill {
  background: #0d9488;
}

.bar-pct {
  font-size: 0.8rem;
  color: #64748b;
  width: 46px;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.bar-row--top .bar-pct {
  color: #0d9488;
  font-weight: 600;
}
</style>
