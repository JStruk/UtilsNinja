<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-1 flex-col border">
        <div class="md:py-2 bg-[#ebebeb]">Enter JSON:</div>
        <div class="flex-grow relative">
          <v-ace-editor
              v-model:value="JSONInput"
              lang="json"
              theme="chrome"
              :options="{ useWorker: true, fontSize: 14, showPrintMargin: false }"
              class="h-full text-purple-500"
              v-debounce:300ms="formatJSON"
          />
        </div>
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
          <vue-json-pretty showLineNumber showLine showIcon :data="formattedJSON"/>
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { VAceEditor } from 'vue3-ace-editor'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import '../../ace-config.js'
import 'vue-json-pretty/lib/styles.css'
import copyIcon from '../assets/copy-icon.png'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '../Layouts/TwoPaneLayout.vue'
import type { JSONDataType } from 'vue-json-pretty/types/utils'

let JSONInput = ref<string>('{}')
const isJSONValid = ref<boolean>(true)
const formattedJSON = ref<JSONDataType>({})

function formatJSON() {
  JSONInput.value.replace(/'/g, '"')
  try {
    formattedJSON.value = JSON.parse(JSONInput.value)
    isJSONValid.value = true
  } catch (e) {
    isJSONValid.value = false
  }
}

function copyButtonClicked() {
  copyToClipboard(JSON.stringify(formattedJSON.value, null, '\t'))
  console.log('toasting')
  toast.success('Formatted JSON copied to clipboard', { autoClose: 2500 })
}

</script>

<style>
.ace_gutter div {
  color: #8F25F5;
}
</style>
