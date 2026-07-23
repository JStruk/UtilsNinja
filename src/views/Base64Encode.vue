<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">String to Encode</h3>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <textarea
            aria-label="input-to-encode"
            v-model="stringToEncode"
            placeholder="Paste your text here..."
            class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
            v-debounce:300ms="encode"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 transition-colors z-10">
          <div class="flex items-center gap-2">
            <div class="bg-emerald-500 w-2 h-2 rounded-full shadow-sm shadow-black/10"></div>
            <h3 class="font-semibold text-emerald-700 dark:text-emerald-400">Encoded Output</h3>
          </div>
          <button 
            v-if="encodedString"
            @click="copyResult"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="flex-1 relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
          <textarea
            aria-label="encoded-text"
            :value="encodedString"
            readonly
            placeholder="Result will appear here..."
            class="w-full h-full p-6 bg-transparent font-mono text-sm text-primary-700 dark:text-primary-400 outline-none resize-none custom-scrollbar"
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Base64Encode } from '@/utilities/Base64Encode'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const stringToEncode = ref<string>('UtilsNinja')
const encodedString = ref<string>('')

function encode() {
  if (!stringToEncode.value) {
    encodedString.value = ''
    return
  }
  try {
    encodedString.value = Base64Encode(stringToEncode.value)
  } catch (caught: unknown) {
    toast.error(caught instanceof Error ? caught.message : 'Unable to encode this value.')
  }
}

async function copyResult() {
  const result = await copyToClipboard(encodedString.value)
  if (result.success) toast.success('Encoded string copied to clipboard', { autoClose: 2500 })
  else toast.error(result.error, { autoClose: 3000 })
}

// Initial encode
encode()
</script>
