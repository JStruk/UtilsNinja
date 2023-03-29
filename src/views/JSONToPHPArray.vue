<template>
  <div class="">
    <div class="bg-white shadow rounded p-5">
      <div class="flex justify-evenly w-4/5">
        <textarea v-model="JSONData" type="text" placeholder="JSON Object" rows="5" class="w-full p-2"></textarea>
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
                @click="convert">Convert
        </button>
      </div>
      <textarea v-model="phpArray" type="text" placeholder="PHP Array" rows="5" class="w-full p-2"></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { JSONToPHPArray } from '@/utilities/JSONToPHPArray'
import 'vue-json-pretty/lib/styles.css'

const JSONData = ref<string>('')
const phpArray = ref()

function convert() {
  phpArray.value = JSONToPHPArray(JSONData.value)
}
</script>
