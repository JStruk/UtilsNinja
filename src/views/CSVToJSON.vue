<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex justify-evenly w-4/5">
        <textarea
            v-model="CSVData"
            type="text"
            placeholder="CSV Data"
            rows="5"
            class="w-full p-2"
            v-debounce:300ms="convert"
        />
      </div>
    </template>
    <template v-slot:right-pane>
      <textarea
          :value="jsonString"
          readonly
          rows="30"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="JSON format"
      />
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CSVToJSON } from '@/utilities/CSVToJSON'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const CSVData = ref<string>('')
const jsonString = ref<string>('')

function convert() {
  jsonString.value = CSVToJSON(CSVData.value)
}
</script>
