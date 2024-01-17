<template>
  <div class="relative flex min-h-screen justify-center overflow-hidden bg-[#EDEDED]">
    <div
        class="flex flex-col pt-12 bg-slate-300 bg-opacity-50 text-center overflow-hidden transition-all duration-500 ease-in-out"
        :class="expanded ? 'w-80 px-6' : 'w-0'"
    >
      <h2 class="font-semibold underline p-4 text-4xl text-purple-700">Tools</h2>
      <ul class="text-xl md:w-64">
        <li v-for="(link, index) in links"
            :key="index"
            class="p-1 px-4 font-bold"
            :class="activeTab === index ? 'bg-purple-600 text-white' : index % 2 === 0 ? 'bg-slate-200 text-purple-600' : 'bg-slate-100 text-purple-600'"
        >
          <router-link :to="{ name: link.route }" @click="() => setActiveTab(index)">
            <p v-html="link.label" />
          </router-link>
        </li>
      </ul>
    </div>
    <div
        class="bg-slate-300 bg-opacity-50 p-2 text-purple-700"
        @click="() => expanded = !expanded"
    >
      <p class="text-4xl" :class="expanded ? 'rotate-180' : ''" >&#10095;</p>
    </div>

    <div class="flex-1 bg-slate-100">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'

let activeTab = ref(0)
let expanded = ref<boolean>(true)

const setActiveTab = (tabNumber: number) => {
  activeTab.value = tabNumber
}

const links = [
  { route: 'FormatJSON', label: 'JSON Formatter' },
  { route: 'LoremIpsumGenerator', label: 'Lorem Ipsum Generator' },
  { route: 'JSONToCSV', label: 'JSON &#10140; CSV' },
  { route: 'CSVToJSON', label: 'CSV &#10140; JSON' },
  { route: 'PHPToJSON', label: 'PHP &#10140; JSON' },
  { route: 'JSONToPHP', label: 'JSON &#10140; PHP' },
  { route: 'Inspector', label: 'Inspector' },
  { route: 'Dates', label: 'Dates' },
  { route: 'Base64Encode', label: 'Base64 Encode' },
  { route: 'Base64Decode', label: 'Base64 Decode' },
  { route: 'LineSort', label: 'Line Sort' },
  { route: 'ColorConverter', label: 'Color Converter' }
]
</script>

<style>
html {
  background: #efefef;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
