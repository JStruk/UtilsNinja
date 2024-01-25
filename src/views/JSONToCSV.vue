<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex justify-evenly w-4/5">
        <textarea
            v-model="JSONInput"
            type="text"
            placeholder="JSON Data"
            rows="5"
            class="w-full p-2"
            v-debounce:300ms="convert"
        />
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

const JSONInput = ref<string>('')
const CSVString = ref<string>('')

function convert() {
  CSVString.value = JSONtoCSV(JSONInput.value)
}
</script>
