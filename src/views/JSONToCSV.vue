<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Input JSON</h3>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <v-ace-editor
              v-model:value="JSONInput"
              lang="json"
              theme="chrome"
              :options="{ useWorker: true, fontSize: 14, showPrintMargin: false, tabSize: 2 }"
              class="h-full w-full"
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
              {{ isJSONValid ? 'CSV Output' : 'Invalid JSON' }}
            </h3>
          </div>
          <button 
            v-if="isJSONValid && CSVString"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy CSV
          </button>
        </div>
        <div class="flex-1 relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
          <textarea
              :value="CSVString"
              readonly
              class="w-full h-full p-4 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
              placeholder="CSV format output..."
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { JSONtoCSV } from '@/utilities/JSONToCSV'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { VAceEditor } from 'vue3-ace-editor'
import '../../ace-config.js'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const JSONInput = ref<string>('[\n  {\n    "id": 1,\n    "name": "Example"\n  }\n]')
const CSVString = ref<string>('')
const isJSONValid = ref<boolean>(true)

function convert() {
  if (!JSONInput.value.trim()) {
    CSVString.value = ''
    isJSONValid.value = true
    return
  }
  
  try {
    // Basic validation check
    JSON.parse(JSONInput.value)
    CSVString.value = JSONtoCSV(JSONInput.value)
    isJSONValid.value = true
  } catch (e) {
    isJSONValid.value = false
    CSVString.value = ''
  }
}

function copyButtonClicked() {
  copyToClipboard(CSVString.value)
  toast.success('CSV copied to clipboard', { autoClose: 2500 })
}

// Initial conversion
convert()
</script>
