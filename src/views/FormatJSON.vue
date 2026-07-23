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
              v-debounce:300ms="formatJSON"
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
              {{ isJSONValid ? 'Valid & Formatted' : 'Invalid JSON' }}
            </h3>
          </div>
          <button 
            v-if="isJSONValid"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <vue-json-pretty showLineNumber showLine showIcon :data="formattedJSON" class="text-sm rounded-xl overflow-hidden shadow-sm"/>
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { VAceEditor } from 'vue3-ace-editor'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import '../../ace-config.js'
import 'vue-json-pretty/lib/styles.css'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '../Layouts/TwoPaneLayout.vue'
import type { JSONDataType } from 'vue-json-pretty/types/utils'

const JSONInput = ref<string>('{}')
const isJSONValid = ref<boolean>(true)
const formattedJSON = ref<JSONDataType>({})

function formatJSON() {
  try {
    formattedJSON.value = JSON.parse(JSONInput.value)
    isJSONValid.value = true
  } catch {
    isJSONValid.value = false
  }
}

async function copyButtonClicked() {
  const result = await copyToClipboard(JSON.stringify(formattedJSON.value, null, '\t'))
  if (result.success) toast.success('Formatted JSON copied to clipboard', { autoClose: 2500 })
  else toast.error(result.error, { autoClose: 3000 })
}

</script>

<style>
.ace_gutter div {
  color: #8F25F5;
}
</style>
