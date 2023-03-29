<template>
  <div class="">
    <div class="bg-white shadow rounded p-5">
      <div class="flex justify-evenly w-4/5">
        <textarea v-model="CSVData" type="text" placeholder="CSV Data" rows="5" class="w-full p-2"></textarea>
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
                @click="convert">Convert
        </button>
      </div>
      <textarea :value="jsonString" readonly rows="30"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="JSON format"></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { CSVToJSON } from '@/utilities/CSVToJSON';

const CSVData = ref<string>('')
const jsonString = ref<string>('')

function convert() {
  jsonString.value = CSVToJSON(CSVData.value)
}
</script>
