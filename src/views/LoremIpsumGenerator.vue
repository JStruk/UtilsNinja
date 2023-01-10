<template>
  <div class="text-purple-500">
    <div class="flex p-6 items-center">
      <div>
        <input v-model="numUnits" type="number" placeholder="Paragraphs" class="border border-purple-300 p-2" />
      </div>

      <div class="flex flex-col m-4">
        <div class="flex justify-between">
          <label for="words">Words</label>
          <input type="radio" id="words" value="words" v-model="selectedLoremUnits" />
        </div>

        <div class="flex justify-between">
          <label for="sentences">Sentences</label>
          <input type="radio" id="sentences" value="sentences" v-model="selectedLoremUnits" />
        </div>

        <div class="flex justify-between space-x-2">
          <label for="paragraphs">Paragraphs</label>
          <input type="radio" id="paragraphs" value="paragraphs" v-model="selectedLoremUnits" />
        </div>
      </div>

      <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
        type="button" @click="getLoremIpsum">Generate</button>
      <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
        type="button" @click="copyToClipboard(lorem)">Copy to Clipboard</button>
    </div>
    <textarea :value="lorem" disabled rows="30"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      placeholder="Lorem Ipsum.."></textarea>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { copyToClipboard } from '../helpers/copyToClipboard'
import { generateLoremIpsum } from '../utilities/loremIpsumGenerator'
import type { LoremUnit } from 'lorem-ipsum/types/src/constants/units';

const lorem = ref<string>('')
const numUnits = ref<number>(5)
const selectedLoremUnits = ref<string>('words');

function getLoremIpsum() {
  lorem.value = generateLoremIpsum(selectedLoremUnits.value as LoremUnit, numUnits.value);
}

</script>

<style>

</style>
