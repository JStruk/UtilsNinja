<template>
  <div class="max-w-5xl mx-auto py-8 px-4 lg:px-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">Random Data Generator</h1>
      <p class="text-slate-600 dark:text-slate-400 font-medium">Generate high-quality mock data for testing and development.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Controls -->
      <div class="lg:col-span-1 space-y-6">
        <div class="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft">
          <div class="space-y-6">
            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Data Type</label>
              <select 
                v-model="selectedType"
                class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-bold transition-all outline-none dark:text-white"
              >
                <option v-for="type in dataTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Count</label>
              <input 
                v-model.number="count"
                type="number"
                min="1"
                max="100"
                class="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-bold transition-all outline-none dark:text-white"
              />
            </div>

            <button 
              @click="generate"
              class="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Generate Data
            </button>
          </div>
        </div>

        <div class="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <p class="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-2">Pro Tip</p>
          <p class="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed font-medium">
            Generated data is randomized using Faker.js. Great for populating test databases or UI mockups.
          </p>
        </div>
      </div>

      <!-- Output -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft overflow-hidden h-full flex flex-col">
          <div class="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 class="font-bold text-slate-700 dark:text-slate-200">Generated Results</h3>
            <button 
              v-if="results.length"
              @click="copyAll"
              class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy All
            </button>
          </div>
          
          <div class="flex-1 p-8 overflow-auto custom-scrollbar">
            <div v-if="results.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p class="font-bold">No data generated yet</p>
              <p class="text-sm font-medium">Select a type and click Generate to begin.</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="(item, index) in results" 
                :key="index"
                class="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-primary-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                <code class="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">{{ item }}</code>
                <button 
                  @click="copyItem(item.toString())"
                  class="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"
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
import { ref } from 'vue'
import { generateRandomData } from '@/utilities/RandomDataGenerator'
import type { DataType, RandomDataValue } from '@/utilities/RandomDataGenerator'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const selectedType = ref<DataType>('name')
const count = ref(10)
const results = ref<RandomDataValue[]>([])

const dataTypes = [
  { label: 'Full Names', value: 'name' },
  { label: 'Email Addresses', value: 'email' },
  { label: 'Phone Numbers', value: 'phone' },
  { label: 'Physical Addresses', value: 'address' },
  { label: 'UUIDs', value: 'uuid' },
  { label: 'Random Numbers', value: 'number' },
  { label: 'Dates (ISO)', value: 'date' },
  { label: 'Credit Card Numbers', value: 'creditCard' },
]

function generate() {
  results.value = generateRandomData(selectedType.value, { count: count.value })
  toast.success(`Generated ${count.value} ${selectedType.value}s`, { autoClose: 1500 })
}

async function copyAll() {
  const text = results.value.join('\n')
  const result = await copyToClipboard(text)
  if (result.success) toast.success('All results copied to clipboard', { autoClose: 2000 })
  else toast.error(result.error, { autoClose: 3000 })
}

async function copyItem(text: string) {
  const result = await copyToClipboard(text)
  if (result.success) toast.success('Copied to clipboard', { autoClose: 1000 })
  else toast.error(result.error, { autoClose: 3000 })
}

// Initial generate
generate()
</script>
