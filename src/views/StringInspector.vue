<template>
  <div class="flex items-center justify-center px-4 space-x-4 h-full overflow-hidden">
    <div class="flex-1 rounded-lg p-2 min-h-1/2 h-full">
      <span>Enter JSON Data:</span>
      <textarea rows=40 v-model="inputText" @input="inspectText" type="text" placeholder="JSON Data"
                class="w-full border border-gray-400 rounded-lg p-2"/>
    </div>

    <div class="flex-1 p-2 h-full overflow-scroll">
      <span>inspector gadget says:</span>
      <div class="border border-gray-400 rounded-lg p-4">
        <vue-json-pretty showLineNumber showLine showIcon :data="output"/>
      </div>
    </div>
  </div>


</template>

<script lang="ts" setup>
import { ref } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { inspect } from '@/utilities/StringInspector';
import type { InspectionResult } from '@/utilities/StringInspector';

const inputText = ref<string>('')
const output = ref<InspectionResult>()

function inspectText() {
  output.value = inspect(inputText.value);
}

</script>

<style>

</style>
