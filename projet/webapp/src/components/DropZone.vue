<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--active': dragging, 'dropzone--filled': !!file }"
    @dragenter.prevent="dragging = true"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".wav,.mp3,.ogg,.flac,.aiff,.m4a"
      style="display: none"
      @change="onFileChange"
    />

    <template v-if="!file">
      <div class="dropzone-icon">🎵</div>
      <div class="dropzone-text">Déposez un fichier audio ici</div>
      <div class="dropzone-sub">ou cliquez pour parcourir</div>
      <div class="dropzone-formats">WAV · MP3 · OGG · FLAC</div>
    </template>

    <template v-else>
      <div class="dropzone-icon">✅</div>
      <div class="dropzone-filename">{{ file.name }}</div>
      <div class="dropzone-sub">Cliquez pour changer de fichier</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const dragging = ref(false)
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) selectFile(f)
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) selectFile(f)
}

function selectFile(f: File) {
  file.value = f
  emit('file-selected', f)
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed #334155;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #0f172a;
  user-select: none;
}

.dropzone:hover,
.dropzone--active {
  border-color: #0d9488;
  background: #0f2027;
}

.dropzone--filled {
  border-color: #0d9488;
  border-style: solid;
  padding: 24px;
}

.dropzone-icon {
  font-size: 2.4rem;
  margin-bottom: 10px;
}

.dropzone-text {
  font-size: 1rem;
  color: #e2e8f0;
  font-weight: 500;
}

.dropzone-filename {
  font-size: 1rem;
  color: #e2e8f0;
  font-weight: 600;
  word-break: break-all;
}

.dropzone-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 6px;
}

.dropzone-formats {
  font-size: 0.75rem;
  color: #475569;
  margin-top: 12px;
  letter-spacing: 0.05em;
}
</style>
