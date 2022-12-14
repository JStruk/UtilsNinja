<template>
  <div class="">
    <div class="bg-white shadow rounded p-5">
      <div class="flex justify-evenly w-4/5">
        <input v-model="numOfParagraphs" type="number" placeholder="Paragraphs" class="w-full" />
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
          @click="generateLorem">Generate</button>
        <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
          @click="copyToClipboard(lorem)">Copy to Clipboard</button>
      </div>
      <textarea :value="lorem" disabled rows="30"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="Lorem Ipsum.."></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LoremIpsum } from 'lorem-ipsum';
import { ref } from 'vue';

const lorem = ref<string>('')
const numOfParagraphs = ref<number>(0)

function generateLorem() {
  const loremIpsumGenerator = new LoremIpsum();
  lorem.value = loremIpsumGenerator.generateParagraphs(numOfParagraphs.value);
}

function copyToClipboard(str: string) {
  navigator.clipboard.writeText(str).then(
    function () {
      console.log('Async: Copying to clipboard was successful!');
    },
    function (err) {
      console.error('Async: Could not copy text: ', err);
    }
  );
}
</script>

<style>

</style>
