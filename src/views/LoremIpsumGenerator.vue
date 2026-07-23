<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      <!-- Controls -->
      <div class="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div class="flex-1 flex flex-col gap-2">
             <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</label>
             <input 
              v-model="numUnits" 
              type="number" 
              class="w-full px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none dark:text-white"
             />
          </div>

          <div class="flex-1 flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Units</label>
            <div class="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <button 
                v-for="unit in ['words', 'sentences', 'paragraphs']" 
                :key="unit"
                @click="selectedLoremUnits = unit"
                class="flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize"
                :class="selectedLoremUnits === unit ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                {{ unit }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-6 lg:pt-0">
            <button 
              @click="getLoremIpsum"
              class="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95"
            >
              Generate
            </button>
            <button 
              v-if="lorem"
              @click="copyLorem"
              class="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              title="Copy"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Output -->
      <div class="p-8 bg-white dark:bg-slate-900">
        <textarea
            v-model="lorem"
            readonly
            placeholder="Generated text will appear here..."
            class="w-full h-[400px] p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-inner resize-none font-sans text-lg text-slate-700 dark:text-slate-300 leading-relaxed custom-scrollbar outline-none"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { generate } from '@/utilities/LoremIpsumGenerator'
import type { LoremUnit } from 'lorem-ipsum/types/src/constants/units'

const lorem = ref<string>('')
const numUnits = ref<number>(5)
const selectedLoremUnits = ref<string>('words')

function getLoremIpsum() {
  lorem.value = generate(selectedLoremUnits.value as LoremUnit, numUnits.value)
}

async function copyLorem() {
  const result = await copyToClipboard(lorem.value)
  if (result.success) toast.success('Lorem ipsum copied to clipboard', { autoClose: 2000 })
  else toast.error(result.error, { autoClose: 3000 })
}

</script>

<style>

</style>
