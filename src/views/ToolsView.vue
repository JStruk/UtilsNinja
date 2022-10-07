<template>
    Tools Page
    <ul class="flex border-b">
        <li :class="{'-mb-px mr-1': activeTab===0}" class="mr-1">
            <a :class="{'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab===0}"
                class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
                @click="() => setActiveTab(0)" href="#">JSON Format</a>
        </li>
        <li :class="{'-mb-px mr-1': activeTab===1}" class="mr-1">
            <a :class="{'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab===1}"
                class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
                @click="() => setActiveTab(1)" href="#">Base 64 Encode/Decode</a>
        </li>
        <li :class="{'-mb-px mr-1': activeTab===2}" class="mr-1">
            <a :class="{'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab===2}"
                class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
                @click="() => setActiveTab(2)" href="#">Lorem Ipsum</a>
        </li>
        <li :class="{'-mb-px mr-1': activeTab===3}" class="mr-1">
            <a :class="{'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab===3}"
                class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
                @click="() => setActiveTab(3)" href="#">JSON to CSV</a>
        </li>
    </ul>
</template>

<script lang="ts" setup>

import { ref } from 'vue'

let activeTab = ref(0)

const setActiveTab = (tabNumber: number) => { activeTab.value = tabNumber }
</script>
