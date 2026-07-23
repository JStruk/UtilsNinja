<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Input String</h3>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <textarea
            v-model="inputText"
            @input="inspectText"
            aria-label="string-inspector"
            placeholder="Paste text to inspect..."
            class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Inspection Analysis</h3>
          <button 
            v-if="output"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy JSON
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <vue-json-pretty showLineNumber showLine showIcon :data="output" class="text-sm rounded-xl overflow-hidden shadow-sm"/>
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { inspect } from '@/utilities/StringInspector'
import type { InspectionResult } from '@/utilities/StringInspector'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const inputText = ref<string>('Hello UtilsNinja!')
const output = ref<InspectionResult>()

function inspectText() {
  if (!inputText.value.trim()) {
    output.value = undefined
    return
  }
  output.value = inspect(inputText.value)
}

async function copyButtonClicked() {
  const result = await copyToClipboard(JSON.stringify(output.value, null, '\t'))
  if (result.success) toast.success('Inspection results copied to clipboard', { autoClose: 2500 })
  else toast.error(result.error, { autoClose: 3000 })
}

// Initial inspection
inspectText()
</script>
