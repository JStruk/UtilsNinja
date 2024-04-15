<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex justify-evenly w-4/5">
        <div class="flex-grow relative">
          <v-ace-editor
              v-model:value="JSONInput"
              lang="json"
              theme="chrome"
              :options="{ useWorker: true, fontSize: 14, showPrintMargin: false }"
              class="h-full text-purple-500"
              v-debounce:300ms="convert"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <textarea
          :value="CSVString"
          readonly
          rows="30"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="CSV format"
      />
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { JSONtoCSV } from '@/utilities/JSONToCSV'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { VAceEditor } from 'vue3-ace-editor'

const JSONInput = ref<string>('')
const CSVString = ref<string>('')

function convert() {
  CSVString.value = JSONtoCSV(JSONInput.value)
}
</script>
