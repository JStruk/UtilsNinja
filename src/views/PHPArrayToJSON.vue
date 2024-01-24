<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-1">
        <textarea
            v-model="PHPArray"
            type="text"
            placeholder="PHP Array"
            rows="5"
            class="w-full p-2"
            v-debounce:300ms="convert"
        />
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

const PHPArray = ref<string>('')
const json = ref()

function convert() {
  try {
    json.value = PHPArrayToJSON(PHPArray.value)
  } catch (e) {}
}
</script>
