<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b bg-white dark:bg-slate-900 z-10">
          <h3 class="font-semibold text-slate-700 dark:text-slate-200">Enter Timestamp</h3>
        </div>
        <div class="flex-1 p-4 bg-slate-50/30 dark:bg-slate-900/10">
          <div class="space-y-4">
            <input
              v-model="inputText"
              @input="formatDate"
              type="text"
              placeholder="e.g. 1704543600"
              class="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none dark:text-white"
            />
            <p class="text-xs text-slate-400 px-2 italic">Accepts Unix timestamps in seconds or milliseconds.</p>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 border-b flex items-center justify-between transition-colors z-10" :class="isTimestampValid ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-rose-50/50 dark:bg-rose-950/20'">
          <div class="flex items-center gap-2">
            <div :class="isTimestampValid ? 'bg-emerald-500' : 'bg-rose-500'" class="w-2 h-2 rounded-full shadow-sm shadow-black/10"></div>
            <h3 class="font-semibold" :class="isTimestampValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">
              {{ isTimestampValid ? 'Valid Date' : 'Invalid Timestamp' }}
            </h3>
          </div>
        </div>
        <div class="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <vue-json-pretty v-if="isTimestampValid" showLineNumber showLine showIcon :data="formattedDate" class="text-sm rounded-xl overflow-hidden shadow-sm"/>
          <div v-else class="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 italic text-sm">
            Waiting for a valid timestamp...
          </div>
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { unixEpochToDate } from '@/utilities/UnixEpochToDate'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const inputText = ref<string>('')
const isTimestampValid = ref<boolean>(false)
const formattedDate = ref()

function formatDate() {
  try {
    formattedDate.value = unixEpochToDate(parseInt(inputText.value))
    isTimestampValid.value = true
  } catch (e) {
    isTimestampValid.value = false
  }
}

</script>

<style>

</style>
