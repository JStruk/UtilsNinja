<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <textarea
          aria-label="input-to-decode"
          v-model="stringToDecode"
          type="text"
          placeholder="String to decode"
          rows="5"
          class="w-full p-2"
          v-debounce:300ms="decode"
      />
    </template>
    <template v-slot:right-pane>
      <textarea
          aria-label="decoded-text"
          :value="decodedString"
          readonly
          rows="30"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Decoded String"
      />
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { Base64Decode } from '@/utilities/Base64Decode'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const stringToDecode = ref<string>('')
const decodedString = ref<string>('')

function decode() {
  try {
    decodedString.value = Base64Decode(stringToDecode.value)
  } catch (e: any) {
    alert(e.message)
  }
}
</script>
