<template>
        <div class="h-full bg-white shadow rounded p-5">
            <div class="flex justify-evenly w-4/5">
                <textarea v-model="Input" type="text" placeholder="Lines" aria-label="input-to-sort" rows="5" class="w-full p-2"></textarea>
                <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button" aria-label="sort-button"
                        @click="convert">Convert
                </button>
                <label>Remove Duplicates</label>
                <input class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 w-12 rounded-lg" type="checkbox" aria-label="remove-duplicates-checkbox"
                        @click="removeDuplicates"
                        :checked="RemoveDuplicates"
                />
            </div>
            <textarea :value="SortedInput" readonly rows="30"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      aria-label="sorted-text"
                      placeholder="Sorted lines"></textarea>
        </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { lineSort } from '@/utilities/LineSort'

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
