<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Base64 to Decode</h3>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <textarea
              v-model="stringToDecode"
              placeholder="Paste Base64 encoded string here..."
              class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
              v-debounce:300ms="decode"
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
              {{ !error ? 'Decoded Result' : 'Decoding Error' }}
            </h3>
          </div>
          <button 
            v-if="!error && decodedString"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="flex-1 relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
          <div v-if="error" class="p-6">
             <div class="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
               <p class="text-sm text-rose-600 dark:text-rose-400 font-mono">{{ error }}</p>
             </div>
          </div>
          <textarea
              v-else
              :value="decodedString"
              readonly
              class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
              placeholder="Decoded string will appear here..."
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Base64Decode } from '@/utilities/Base64Decode'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const stringToDecode = ref<string>('VXRpbHNOaW5qYSBpcyBhd2Vzb21lIQ==')
const decodedString = ref<string>('')
const error = ref<string>('')

function decode() {
  if (!stringToDecode.value.trim()) {
    decodedString.value = ''
    error.value = ''
    return
  }
  
  try {
    decodedString.value = Base64Decode(stringToDecode.value)
    error.value = ''
  } catch (e: any) {
    error.value = e.message || 'Invalid Base64 sequence'
    decodedString.value = ''
  }
}

async function copyButtonClicked() {
  const result = await copyToClipboard(decodedString.value)
  if (result.success) toast.success('Decoded string copied to clipboard', { autoClose: 2500 })
  else toast.error(result.error, { autoClose: 3000 })
}

// Initial decode
decode()
</script>
