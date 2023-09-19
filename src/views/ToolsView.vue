<template>
  <ul class="container mx-auto justify-center flex border-b pt-6">
    <li v-for="(link, index) in links" :key="index" :class="{ ' -mb-px mr-1': activeTab === index }" class="mr-1">
      <router-link
          :to="{ name: link.route }"
          :class="{ 'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab === index }"
          class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
          @click="() => setActiveTab(index)"
      >{{ link.label }}
      </router-link>
    </li>
  </ul>
  <router-view class="container mx-auto"></router-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let activeTab = ref(0)

const setActiveTab = (tabNumber: number) => {
  activeTab.value = tabNumber
}

const links = [
  { route: 'FormatJSON', label: 'JSON Format' },
  { route: 'LoremIpsumGenerator', label: 'Lorem Ipsum' },
  { route: 'JSONToCSV', label: 'JSON to CSV' },
  { route: 'CSVToJSON', label: 'CSV to JSON' },
  { route: 'Inspector', label: 'Inspector' },
  { route: 'Dates', label: 'Dates' },
  { route: 'PHPToJSON', label: 'PHP To JSON' },
  { route: 'JSONToPHP', label: 'JSON To PHP' },
  { route: 'Base64Encode', label: 'Base64Encode' },
  { route: 'Base64Decode', label: 'Base64Decode' },
  { route: 'LineSort', label: 'LineSort' }
]
</script>
