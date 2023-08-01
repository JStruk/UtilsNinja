<template>
  <div class="">
    <div class="bg-white shadow rounded p-5">
      <div class="flex justify-evenly w-4/5">
        <textarea v-model="stringToEncode" type="text" placeholder="String to encode" rows="5" class="w-full p-2"></textarea>
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
                @click="encode">Encode
        </button>
      </div>
      <textarea :value="encodedString" readonly rows="30"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Encoded String"></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { Base64Encode } from '@/utilities/Base64Encode'

const stringToEncode = ref<string>('')
const encodedString = ref<string>('')

function encode() {
  try {
    encodedString.value = Base64Encode(stringToEncode.value)
  } catch (e) {
    alert(e.message)
  }
}
</script>
