<template>
  <div class="model-selector">
    <div class="model-selector-label">Modèle</div>
    <div class="model-options">
      <label
        v-for="(model, key) in MODELS"
        :key="key"
        class="model-option"
        :class="{ 'model-option--selected': selected === key }"
      >
        <input
          type="radio"
          :value="key"
          v-model="selected"
          style="display: none"
        />
        <div class="model-option-name">{{ model.label }}</div>
        <div class="model-option-desc">{{ model.description }}</div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MODELS } from '../constants'
import type { ModelId } from '../constants'

const emit = defineEmits<{
  (e: 'model-changed', id: ModelId): void
}>()

const selected = ref<ModelId>('cnn')

watch(selected, val => emit('model-changed', val))
emit('model-changed', selected.value)
</script>

<style scoped>
.model-selector {
  margin-bottom: 16px;
}

.model-selector-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 8px;
}

.model-options {
  display: flex;
  gap: 10px;
}

.model-option {
  flex: 1;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: #0f172a;
}

.model-option:hover {
  border-color: #334155;
}

.model-option--selected {
  border-color: #0d9488;
  background: #042f2e;
}

.model-option-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
}

.model-option-desc {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.model-option--selected .model-option-desc {
  color: #94a3b8;
}
</style>
