<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-1 justify-evenly w-4/5">
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
      <div class="flex flex-1 flex-col text-center">
        <div class="rounded md:py-2" :class="isJSONValid ? 'bg-green-400' : 'bg-red-500'">
          <div v-if="isJSONValid" class="flex items-center justify-center space-x-2">
            <h3 class="text-white font-bold">JSON Valid & Formatted </h3>
            <img
                :src="copyIcon"
                alt="Copy to Clipboard"
                class="h-5 hover:h-6 hover:border"
                title="copy to clipboard"
                @click="copyButtonClicked"
            />
          </div>
          <h3 v-else class="text-white font-bold">JSON Invalid!</h3>
        </div>
        <div class="flex-grow bg-gray-100 p-2">
          <vue-json-pretty showLineNumber showLine showIcon :data="jsonString"/>
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CSVToJSON } from '@/utilities/CSVToJSON'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import VueJsonPretty from 'vue-json-pretty'
import copyIcon from '@/assets/copy-icon.png'
import { copyToClipboard } from '@/helpers/CopyToClipboard';
import { toast } from 'vue3-toastify';

const CSVData = ref<string>('')
const jsonString = ref<string>('')
const isJSONValid = ref<boolean>(true)

function convert() {
  try {
    jsonString.value = CSVToJSON(CSVData.value)
    isJSONValid.value = true
  } catch (e) {
    isJSONValid.value = false
  }
}

function copyButtonClicked() {
  copyToClipboard(JSON.stringify(jsonString.value, null, '\t'))
  console.log('toasting')
  toast.success('Formatted JSON copied to clipboard', { autoClose: 2500 })
}
</script>
