<template>
    <div class="">
        <div class="bg-white shadow rounded p-5">
            <div class="flex justify-evenly w-4/5">
                <textarea v-model="csv_data" type="text" placeholder="CSV Data" class="w-full"></textarea>
                <button class="bg-indigo-600 text-white text-sm leading-6 font-medium mx-4 rounded-lg w-28" type="button"
                @click="convert">Convert</button>
            </div>
            <textarea :value="json_value_str" disabled rows="30" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
            placeholder="JSON format"></textarea>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';

const json_value = ref<Array<Object>>([])
const csv_data = ref<string>('')
const json_value_str = ref<string>('')

function convert() {
    const all_data = csv_data.value.split('\n')
    const headers = all_data[0].split(',')
    json_value.value = all_data.slice(1).map(line => {
        const fields = line.split(',')
        return Object.fromEntries(headers.map((h, i) => [h, fields[i]]))
    })
    json_value_str.value = JSON.stringify(json_value.value, null, "\t")
}

console.log(json_value)
</script>

<style>

</style>
