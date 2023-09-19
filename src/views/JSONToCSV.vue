<template>
    <div class="flex justify-center px-4 space-x-4 h-full overflow-hidden">
        <div class="flex-1 rounded-lg p-2 min-h-1/2 h-full">
            <span>Enter JSON Data:</span>
            <textarea v-model="JSONInput" type="text" placeholder="JSON Data" rows="30"
                      class="w-full border border-gray-400 rounded-lg p-2" />

        </div>
        <div class="pt-12">
            <button class="bg-indigo-600 text-white text-sm leading-6 font-medium p-2 rounded-lg w-28 h-auto" type="button"
                    @click="convert"
            >Convert
            </button>
        </div>
        <div class="flex-1 p-2 h-full overflow-scroll">
            <span>Converted CSV Data:</span>
            <div class="border border-gray-400 rounded-lg p-4">
                <textarea :value="CSVString" readonly rows="30" placeholder="CSV format"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { JSONtoCSV } from '@/utilities/JSONToCSV'
import VueJsonPretty from 'vue-json-pretty'

const JSONInput = ref<string>('')
const CSVString = ref<string>('')

function convert() {
    CSVString.value = JSONtoCSV(JSONInput.value)
}
</script>
