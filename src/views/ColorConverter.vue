<template>
    <div class="border-2 space-y-4 flex flex-col text-right items-center">
        <div class="flex">
            <div class="p-2 w-48">
                <p>Enter color code:</p>
                <p class="text-xs">Accept RGB, HEX, CMYK, HSL</p>
            </div>
            <input type="text" v-model="colorInput" @input="convert" class="border rounded border-black p-1 w-96">
        </div>
        <div class="flex">
            <p class="text-lg w-48 p-2">Color:</p>
            <input type="text" class="border rounded border-gray-300 p-1 w-96" :style="{ backgroundColor: hex }" readonly>
        </div>
        <div class="flex">
            <p class="text-lg w-48 p-2">RGB:</p>
            <input type="text" id="rgb" v-model="rgb" class="border rounded border-gray-300 p-1 w-96" readonly>
        </div>
        <div class="flex">
            <p class="text-lg w-48 p-2">HEX:</p>
            <input type="text" id="hex" v-model="hex" class="border rounded border-gray-300 p-1 w-96" readonly>
        </div>
        <div class="flex">
            <p class="text-lg w-48 p-2">CMYK:</p>
            <input type="text" id="cmyk" v-model="cmyk" class="border rounded border-gray-300 p-1 w-96" readonly>
        </div>
        <div class="flex">
            <p class="text-lg w-48 p-2">HSL:</p>
            <input type="text" id="hsl" v-model="hsl" class="border rounded border-gray-300 p-1 w-96" readonly>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ColorConverter } from '@/utilities/ColorConverter'

const colorInput = ref<string>('')
const rgb = ref<string>('')
const hex = ref<string>('')
const hsl = ref<string>('')
const cmyk = ref<string>('')

function convert() {
    try {
        const convertedColorCodes = ColorConverter(colorInput.value)
        rgb.value = convertedColorCodes.rgb
        hex.value = convertedColorCodes.hex
        hsl.value = convertedColorCodes.hsl
        cmyk.value = convertedColorCodes.cmyk

    } catch (e: any) {
        console.log(e.message)
        // alert(e.message)
    }
}

</script>