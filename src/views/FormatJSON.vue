<template>
  <div class="flex items-center justify-center px-4 space-x-4 h-full overflow-hidden">
    <div class="flex-1 rounded-lg p-2 min-h-1/2 h-full">
      <span>Enter JSON Data:</span>
      <textarea rows=40 v-model="inputText" type="text" placeholder="JSON Data"
                class="w-full border border-gray-400 rounded-lg p-2"/>
    </div>

    <div class="flex-1 p-2 h-full overflow-scroll">
      <span>Formatted JSON: (valid: {{isJSONValid}}})</span>
      <div class="border border-gray-400 rounded-lg p-4">
        <vue-json-pretty
            showLineNumber
            showLine
            showIcon
            :data="formattedJSON"/>
      </div>
    </div>
  </div>


</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const inputText = ref<string>('{}')
const isJSONValid = ref<boolean>(false);

console.log(JSON.stringify({ 'this': 'is stringified' }));

const formattedJSON = computed(() => {

  try {
    console.log(inputText.value);
    inputText.value.replace(/'/g, '"')
    const parsed = JSON.parse(inputText.value);
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    isJSONValid.value = true;
    return parsed;
  } catch (e) {
    console.log(e);
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    isJSONValid.value = false;
    return {}
  }
})
</script>

<style>

</style>
