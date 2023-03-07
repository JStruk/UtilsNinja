<template>
  <div class="">
    <div class="bg-white shadow rounded p-5">
      <div class="flex justify-evenly w-4/5">
        <textarea v-model="PHPArray" type="text" placeholder="PHP Array" rows="5" class="w-full p-2"></textarea>
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
                @click="convert">Convert
        </button>
      </div>
      <vue-json-pretty showLineNumber showLine showIcon :data="json" />
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { PHPArrayToJson } from '@/utilities/PHPArrayToJson';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const PHPArray = ref<string>('')
const json = ref()

function convert() {
  json.value = PHPArrayToJson(PHPArray.value)
}
</script>
