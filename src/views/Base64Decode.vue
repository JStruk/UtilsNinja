<template>
<div class="">
<div class="bg-white shadow rounded p-5">
  <div class="flex justify-evenly w-4/5">
        <textarea aria-label="input-to-decode" v-model="stringToDecode" type="text" placeholder="String to decode" rows="5"
                  class="w-full p-2"></textarea>
    <button aria-label="decode-text" class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
            @click="decode">Decode
    </button>
  </div>
  <textarea aria-label="decoded-text" :value="decodedString" readonly rows="30"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Decoded String"></textarea>
</div>
</div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { Base64Decode } from '@/utilities/Base64Decode'

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
