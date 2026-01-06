<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">QR Code Settings</h3>
        </div>
        <div class="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar">
          <!-- Content Input -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
            <textarea
              v-model="qrContent"
              rows="4"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Enter URL or text here..."
            ></textarea>
          </div>

          <!-- Configuration Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Size -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Size (px)</label>
              <input
                v-model.number="qrSize"
                type="number"
                min="100"
                max="1000"
                step="10"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <!-- Level -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Error Correction</label>
              <select
                v-model="qrLevel"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="L">Level L (7%)</option>
                <option value="M">Level M (15%)</option>
                <option value="Q">Level Q (25%)</option>
                <option value="H">Level H (30%)</option>
              </select>
            </div>
          </div>

          <!-- Colors -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Foreground Color</label>
              <div class="flex gap-2">
                <input
                  v-model="qrForeground"
                  type="color"
                  class="h-10 w-12 p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  v-model="qrForeground"
                  type="text"
                  class="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Background Color</label>
              <div class="flex gap-2">
                <input
                  v-model="qrBackground"
                  type="color"
                  class="h-10 w-12 p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  v-model="qrBackground"
                  type="text"
                  class="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Preview</h3>
          <button
            @click="downloadQR"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            :disabled="!qrContent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download PNG
          </button>
        </div>
        <div class="flex-1 flex items-center justify-center p-8">
          <div 
            v-if="qrContent"
            class="p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:scale-[1.02]"
          >
            <qrcode-vue
              id="qr-code-canvas"
              :value="qrContent"
              :size="qrSize"
              :level="qrLevel"
              :foreground="qrForeground"
              :background="qrBackground"
              render-as="canvas"
            />
          </div>
          <div v-else class="text-center space-y-4">
            <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>
            </div>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-sm">Enter content to preview QR code</p>
          </div>
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import TwoPaneLayout from '../Layouts/TwoPaneLayout.vue'
import { toast } from 'vue3-toastify'

const qrContent = ref('')
const qrSize = ref(256)
const qrLevel = ref<'L' | 'M' | 'Q' | 'H'>('H')
const qrForeground = ref('#000000')
const qrBackground = ref('#ffffff')

const downloadQR = () => {
  const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
  if (!canvas) {
    toast.error('Failed to generate PNG')
    return
  }

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `qrcode-${Date.now()}.png`
  link.href = url
  link.click()
  toast.success('QR Code downloaded successfully')
}
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.02);
}

custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dark custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
