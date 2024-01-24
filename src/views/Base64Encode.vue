<template>
    <TwoPaneLayout>
    <template v-slot:left-pane>
      <textarea
          aria-label="input-to-encode"
          v-model="stringToEncode"
          type="text"
          placeholder="String to encode"
          rows="5"
          class="w-full p-2"
          v-debounce:300ms="encode"
      />
    </template>
    <template v-slot:right-pane>
      <textarea
          aria-label="encoded-text"
          :value="encodedString"
          readonly
          rows="30"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Encoded String"
      />
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { Base64Encode } from '@/utilities/Base64Encode'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const stringToEncode = ref<string>('')
const encodedString = ref<string>('')

function encode() {
  try {
    encodedString.value = Base64Encode(stringToEncode.value)
  } catch (e: any) {
    alert(e.message)
  }
}
</script>
