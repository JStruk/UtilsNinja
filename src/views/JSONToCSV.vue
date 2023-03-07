<template>
  <div class="">
    <div class="bg-white shadow rounded p-5">
      <div class="flex justify-evenly w-4/5">
        <textarea v-model="JSONInput" type="text" placeholder="JSON Data" rows="5" class="w-full p-2"></textarea>
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
                @click="convert">Convert
        </button>
      </div>
      <textarea :value="CSVString" readonly rows="30"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="CSV format"></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { convertJSONtoCSV } from '@/utilities/JSONToCSV';

const JSONInput = ref<string>('')
const CSVString = ref<string>('')

function convert() {
  CSVString.value = convertJSONtoCSV(JSONInput.value)
}
</script>
