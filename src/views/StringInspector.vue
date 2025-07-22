<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex-1 rounded-lg p-2 min-h-1/2 h-full overflow-auto dark:bg-gray-700 dark:text-purple-200">
        <span>Enter String:</span>
        <textarea
            rows=40
            v-model="inputText"
            @input="inspectText"
            type="text"
            aria-label="string-inspector"
            class="w-full border border-gray-400 rounded-lg p-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex-1 p-2 h-full overflow-scroll dark:bg-gray-700 dark:text-purple-200">
        <span>inspector gadget says:</span>
        <div class="border border-gray-400 rounded-lg p-4 dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <vue-json-pretty
              showLineNumber
              showLine
              showIcon
              :data="output"
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { inspect } from '@/utilities/StringInspector'
import type { InspectionResult } from '@/utilities/StringInspector'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const inputText = ref<string>('')
const output = ref<InspectionResult>()

function inspectText() {
  output.value = inspect(inputText.value)
}

</script>

<style>

</style>
