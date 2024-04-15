<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-1">
        <div class="flex-grow relative">
          <v-ace-editor
              v-model:value="PHPInput"
              lang="php"
              theme="chrome"
              :options="{ useWorker: false, fontSize: 14, showPrintMargin: false, inlineEnabled: true }"
              class="h-full text-purple-500"
              v-debounce:300ms="convert"
          />
        </div>
      </div>
    </template>
    <template v-slot:right-pane>
      <vue-json-pretty
          showLineNumber
          showLine
          showIcon
          :data="json"
          class="flex-1"
      />
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

function convert() {
  try {
    json.value = PHPArrayToJSON(PHPInput.value)
  } catch (e) {
    // this is just so we don't flood the console
  }
}
</script>
