<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Input Lines</h3>
          <div class="flex items-center gap-3">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Remove Duplicates</span>
            <button 
              @click="toggleDeDupe"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="deDupe ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="deDupe ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
        <div class="flex-1 relative overflow-hidden">
          <textarea
              v-model="input"
              placeholder="Enter lines to sort (one per line)..."
              class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
              v-debounce:300ms="convert"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 transition-colors z-10">
          <div class="flex items-center gap-2">
            <div class="bg-emerald-500 w-2 h-2 rounded-full shadow-sm shadow-black/10"></div>
            <h3 class="font-semibold text-emerald-700 dark:text-emerald-400">Sorted Result</h3>
          </div>
          <button 
            v-if="sortedInput"
            @click="copyButtonClicked"
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="flex-1 relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
          <textarea
              :value="sortedInput"
              readonly
              class="w-full h-full p-6 bg-transparent font-mono text-sm text-slate-600 dark:text-slate-300 outline-none resize-none custom-scrollbar"
              placeholder="Sorted lines will appear here..."
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { lineSort } from '@/utilities/LineSort'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const input = ref<string>('Zebra\nApple\nMonkey\nApple\nGrape')
const sortedInput = ref<string>('')
const deDupe = ref<boolean>(true)

function convert() {
  if (!input.value.trim()) {
    sortedInput.value = ''
    return
  }
  sortedInput.value = lineSort(input.value, deDupe.value)
}

function toggleDeDupe() {
  deDupe.value = !deDupe.value
  convert()
}

function copyButtonClicked() {
  copyToClipboard(sortedInput.value)
  toast.success('Sorted lines copied to clipboard', { autoClose: 2500 })
}

// Initial convert
convert()
</script>
