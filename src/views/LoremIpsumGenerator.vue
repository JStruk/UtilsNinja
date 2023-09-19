<template>
    <div class="text-purple-500 flex justify-center items-center mt-10 space-x-10 font-light">
        <div class="flex flex-col space-y-8 p-6 text-center">
            <span class="text-xl font-normal"> Settings: </span>

            <div>
                <input v-model="numUnits" type="number" placeholder="Paragraphs" class="border border-purple-300 p-2"/>
            </div>

            <div class="flex flex-col m-4">
                <div class="flex justify-between">
                    <label for="words">Words</label>
                    <input type="radio" id="words" value="words" v-model="selectedLoremUnits"/>
                </div>

                <div class="flex justify-between">
                    <label for="sentences">Sentences</label>
                    <input type="radio" id="sentences" value="sentences" v-model="selectedLoremUnits"/>
                </div>

                <div class="flex justify-between space-x-2">
                    <label for="paragraphs">Paragraphs</label>
                    <input type="radio" id="paragraphs" value="paragraphs" v-model="selectedLoremUnits"/>
                </div>
            </div>

            <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
                    type="button" @click="getLoremIpsum"
            >Generate
            </button>
            <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
                    type="button" @click="copyToClipboard(lorem)"
            >Copy to Clipboard
            </button>
        </div>
        <div class="w-1/2">
            <textarea :value="lorem" disabled rows="30"
                      class="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Lorem Ipsum.."
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { copyToClipboard } from '../helpers/CopyToClipboard'
import { generate } from '../utilities/LoremIpsumGenerator'
import type { LoremUnit } from 'lorem-ipsum/types/src/constants/units'

const lorem = ref<string>('')
const numUnits = ref<number>(5)
const selectedLoremUnits = ref<string>('words')

function getLoremIpsum() {
    lorem.value = generate(selectedLoremUnits.value as LoremUnit, numUnits.value)
}

</script>

<style>

</style>
