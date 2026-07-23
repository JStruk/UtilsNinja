<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Input PHP Array</h3>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <v-ace-editor
              v-model:value="PHPInput"
              lang="php"
              theme="chrome"
              :options="{ useWorker: false, fontSize: 14, showPrintMargin: false, tabSize: 2 }"
              class="h-full w-full"
              v-debounce:300ms="convert"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between transition-colors z-10" :class="!error ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-rose-50/50 dark:bg-rose-950/20'">
          <div class="flex items-center gap-2">
            <div :class="!error ? 'bg-emerald-500' : 'bg-rose-500'" class="w-2 h-2 rounded-full shadow-sm shadow-black/10"></div>
            <h3 class="font-semibold" :class="!error ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">
              {{ !error ? 'Valid JSON Output' : 'Invalid PHP Array' }}
            </h3>
          </div>
          <button 
            v-if="!error && jsonOutput"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy JSON
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <p class="text-sm text-rose-600 dark:text-rose-400 font-mono">{{ error }}</p>
          </div>
          <vue-json-pretty 
            v-else
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
import { PHPArrayToJSON } from '@/utilities/PHPArrayToJSON'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { VAceEditor } from 'vue3-ace-editor'
import '../../ace-config.js'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const PHPInput = ref<string>("[\n  'status' => 'success',\n  'data' => [\n    'id' => 1,\n    'name' => 'Ninja'\n  ]\n]")
const jsonOutput = ref<any>(null)
const error = ref<string>('')

function convert() {
  if (!PHPInput.value.trim()) {
    jsonOutput.value = null
    error.value = ''
    return
  }
  
  try {
    error.value = ''
    jsonOutput.value = PHPArrayToJSON(PHPInput.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to convert PHP array to JSON'
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
