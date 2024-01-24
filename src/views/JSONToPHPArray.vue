<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex justify-evenly w-4/5">
        <textarea
            v-model="JSONData"
            type="text"
            placeholder="JSON Object"
            rows="5"
            class="w-full p-2"
            v-debounce:300ms="convert"
        />
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

const JSONData = ref<string>('')
const phpArray = ref()

function convert() {
  phpArray.value = JSONToPHPArray(JSONData.value)
}
</script>
