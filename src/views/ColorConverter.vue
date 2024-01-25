<template>
  <div class="h-full space-y-4 pt-12 flex flex-col text-right text-purple-500">
    <div class="flex mb-12">
      <div class="p-2">
        <p class="text-xl font-bold">Enter color code:</p>
        <p class="text-xs">Accepts RGB, HEX, CMYK, HSL</p>
        <p class="text-xs">or color name (e.g. "red")</p>
      </div>
      <div class="flex flex-col overflow-ellipsis">
        <input type="text" v-model="colorInput" v-debounce:300ms="convert"
               class="border rounded border-black p-1 text-black text-xl">
        <p v-if="errorMessage" class="text-red-500 text-sm text-left">{{ errorMessage }}</p>
      </div>
    </div>
    <div class="flex space-x-2 items-center">
      <p class="text-lg lg:w-48">Color:</p>
      <input type="text" class="border rounded border-gray-300 p-1" :style="{ backgroundColor: hex }" readonly>
    </div>
    <div class="flex space-x-2 items-center">
      <p class="text-lg lg:w-48">RGB:</p>
      <input type="text" id="rgb" v-model="rgb" class="border rounded border-gray-300 p-1 text-black" readonly>
      <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
              type="button" @click="copyToClipboard(rgb)">Copy to Clipboard
      </button>
    </div>
    <div class="flex space-x-2 items-center">
      <p class="text-lg lg:w-48">HEX:</p>
      <input type="text" id="rgb" v-model="hex" class="border rounded border-gray-300 p-1 text-black" readonly>
      <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
              type="button" @click="copyToClipboard(hex)">Copy to Clipboard
      </button>
    </div>
    <div class="flex space-x-2 items-center">
      <p class="text-lg lg:w-48">CMYK:</p>
      <input type="text" id="rgb" v-model="cmyk" class="border rounded border-gray-300 p-1 text-black" readonly>
      <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
              type="button" @click="copyToClipboard(cmyk)">Copy to Clipboard
      </button>
    </div>
    <div class="flex space-x-2 items-center">
      <p class="text-lg lg:w-48">HSL:</p>
      <input type="text" id="rgb" v-model="hsl" class="border rounded border-gray-300 p-1 text-black" readonly>
      <button class="bg-purple-500 hover:bg-purple-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg p-2"
              type="button" @click="copyToClipboard(hsl)">Copy to Clipboard
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ColorConverter } from '@/utilities/ColorConverter'
import { copyToClipboard } from '@/helpers/CopyToClipboard'

const colorInput = ref<string>('')
const rgb = ref<string>('')
const hex = ref<string>('')
const hsl = ref<string>('')
const cmyk = ref<string>('')
let errorMessage = ref<string | null>('')

function convert() {
  try {
    const convertedColorCodes = ColorConverter(colorInput.value.toLowerCase())
    errorMessage.value = null
    rgb.value = convertedColorCodes.rgb
    hex.value = convertedColorCodes.hex
    hsl.value = convertedColorCodes.hsl
    cmyk.value = convertedColorCodes.cmyk

  } catch (e: any) {
    if (colorInput.value) {
      errorMessage.value = e.message
    }
  }
}

</script>