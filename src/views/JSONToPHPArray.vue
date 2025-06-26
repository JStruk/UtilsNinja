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
          v-model="phpArray"
          type="text"
          placeholder="PHP Array"
          rows="5"
          class="w-full p-2"
      />
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { JSONToPHPArray } from '@/utilities/JSONToPHPArray'
import 'vue-json-pretty/lib/styles.css'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { VAceEditor } from 'vue3-ace-editor'

const JSONInput = ref<string>('')
const phpArray = ref()

function convert() {
  phpArray.value = JSONToPHPArray(JSONInput.value)
}
</script>
