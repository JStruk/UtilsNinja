<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Input CSV</h3>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <textarea
              v-model="CSVData"
              placeholder="Paste your CSV data here..."
              class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
              v-debounce:300ms="convert"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between transition-colors z-10" :class="isJSONValid ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-rose-50/50 dark:bg-rose-950/20'">
          <div class="flex items-center gap-2">
            <div :class="isJSONValid ? 'bg-emerald-500' : 'bg-rose-500'" class="w-2 h-2 rounded-full shadow-sm shadow-black/10"></div>
            <h3 class="font-semibold" :class="isJSONValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">
              {{ isJSONValid ? 'Valid JSON Output' : 'Invalid CSV Data' }}
            </h3>
          </div>
          <button 
            v-if="isJSONValid && jsonOutput"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy JSON
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <vue-json-pretty 
            showLineNumber 
            showLine 
            showIcon 
            :data="jsonOutput" 
            class="text-sm rounded-xl overflow-hidden shadow-sm"
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CSVToJSON } from '@/utilities/CSVToJSON'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const CSVData = ref<string>('id,name,email\n1,Ninja,ninja@example.com\n2,Shinobi,shinobi@example.com')
const jsonOutput = ref<any>(null)
const isJSONValid = ref<boolean>(true)

function convert() {
  if (!CSVData.value.trim()) {
    jsonOutput.value = null
    isJSONValid.value = true
    return
  }
  
  try {
    const result = CSVToJSON(CSVData.value)
    // The utility returns a stringified JSON, let's parse it for vue-json-pretty
    jsonOutput.value = typeof result === 'string' ? JSON.parse(result) : result
    isJSONValid.value = true
  } catch (e) {
    isJSONValid.value = false
    jsonOutput.value = null
  }
}

async function copyButtonClicked() {
  const result = await copyToClipboard(JSON.stringify(jsonOutput.value, null, '\t'))
  if (result.success) toast.success('JSON copied to clipboard', { autoClose: 2500 })
  else toast.error(result.error, { autoClose: 3000 })
}

// Initial conversion
convert()
</script>
