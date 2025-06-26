<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-1">
        <div class="flex-grow relative">
          <v-ace-editor
              v-model:value="PHPInput"
              lang="php"
              theme="chrome"
              :options="{ useWorker: false, fontSize: 14, showPrintMargin: false}"
              class="h-full text-purple-500"
              v-debounce:300ms="convert"
          />
          <div v-if="error" class="absolute bottom-0 left-0 right-0 bg-red-100 text-red-700 p-2 text-sm">
            {{ error }}
          </div>
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <vue-json-pretty
          v-if="!error"
          showLineNumber
          showLine
          showIcon
          :data="json"
          class="flex-1"
      />
      <div v-else class="flex-1 flex items-center justify-center text-gray-500">
        Invalid PHP array format
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PHPArrayToJSON } from '@/utilities/PHPArrayToJSON'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { VAceEditor } from 'vue3-ace-editor'

const PHPInput = ref<string>('')
const json = ref()
const error = ref<string>('')

function convert() {
  try {
    error.value = ''
    json.value = PHPArrayToJSON(PHPInput.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to convert PHP array to JSON'
    json.value = null
  }
}
</script>
