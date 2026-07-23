<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      <!-- Input Section -->
      <div class="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1">Color Converter</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Enter HEX, RGB, HSL, or CMYK codes.</p>
          </div>
          <div class="flex-[2] relative">
            <input 
              type="text" 
              v-model="colorInput" 
              v-debounce:300ms="convert"
              placeholder="e.g. #8b5cf6, rgb(139, 92, 246)..."
              class="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none dark:text-white"
            >
            <p v-if="errorMessage" class="absolute -bottom-6 left-2 text-rose-500 text-xs font-medium">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="p-8 bg-white dark:bg-slate-900">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Preview Card -->
          <div class="flex flex-col gap-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</h4>
            <div 
              class="flex-1 min-h-[160px] rounded-2xl shadow-inner border border-black/5 flex items-end justify-center p-6 relative overflow-hidden group"
              :style="{ backgroundColor: hex || '#f8fafc' }"
            >
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity"></div>
              <span class="relative z-10 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg text-sm font-bold shadow-xl transition-all group-hover:scale-110" :style="{ color: hex }">
                {{ hex || 'No Color Selected' }}
              </span>
            </div>
          </div>

          <!-- Conversion Items -->
          <div class="space-y-4">
             <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Formats</h4>
             
             <div v-for="(val, label) in formats" :key="label" class="group relative">
               <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                 <div class="flex flex-col">
                   <span class="text-[10px] font-bold text-slate-400 uppercase">{{ label }}</span>
                   <span class="font-mono text-sm dark:text-slate-200">{{ val || '-' }}</span>
                 </div>
                 <button 
                  @click="copyVal(val)" 
                  class="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Copy"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ColorConverter } from '@/utilities/ColorConverter'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const colorInput = ref<string>('')
const rgb = ref<string>('')
const hex = ref<string>('')
const hsl = ref<string>('')
const cmyk = ref<string>('')
const errorMessage = ref<string | null>(null)

const formats = computed(() => ({
  'HEX': hex.value,
  'RGB': rgb.value,
  'HSL': hsl.value,
  'CMYK': cmyk.value
}))

function convert() {
  if (!colorInput.value) {
    errorMessage.value = null
    rgb.value = hex.value = hsl.value = cmyk.value = ''
    return
  }
  
  try {
    const convertedColorCodes = ColorConverter(colorInput.value.toLowerCase())
    errorMessage.value = null
    rgb.value = convertedColorCodes.rgb
    hex.value = convertedColorCodes.hex
    hsl.value = convertedColorCodes.hsl
    cmyk.value = convertedColorCodes.cmyk
  } catch (e: any) {
    errorMessage.value = e.message
  }
}

async function copyVal(val: string) {
  if (!val) return
  const result = await copyToClipboard(val)
  if (result.success) toast.success('Color copied to clipboard')
  else toast.error(result.error, { autoClose: 3000 })
}
</script>
