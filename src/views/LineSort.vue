<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex flex-col w-full">
        <div class="flex">
          <label>Remove Duplicates</label>
          <input
              class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 w-12 rounded-lg"
              type="checkbox"
              aria-label="remove-duplicates-checkbox"
              @click="removeDuplicates"
              :checked="RemoveDuplicates"
          />
        </div>

        <textarea
            v-model="Input"
            type="text"
            placeholder="Lines"
            aria-label="input-to-sort"
            class="w-full p-2 flex-grow"
            v-debounce:300ms="convert"
        />

      </div>
    </template>
    <template v-slot:right-pane>
       <textarea
           :value="SortedInput"
           readonly
           rows="30"
           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
           aria-label="sorted-text"
           placeholder="Sorted lines"/>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { lineSort } from '@/utilities/LineSort'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const Input = ref<string>('')
const SortedInput = ref<string>('')
const RemoveDuplicates = ref<boolean>(true)

function convert() {
  SortedInput.value = lineSort(Input.value, RemoveDuplicates.value)
}

function removeDuplicates() {
  RemoveDuplicates.value = !RemoveDuplicates.value
}
</script>
