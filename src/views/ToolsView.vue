<template>
  <ul class="flex border-b pt-6">
    <li v-for="(link, index) in links" :key="index" :class="{ '-mb-px mr-1': activeTab === index }" class="mr-1">
      <router-link
          :to="{ name: link.route }"
          :class="{ 'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab === index }"
          class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
          @click="() => setActiveTab(index)"
      >{{ link.label }}
      </router-link>
    </li>
  </ul>
  <router-view class="p-4"></router-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

let activeTab = ref(0);

const setActiveTab = (tabNumber: number) => {
  activeTab.value = tabNumber;
};

const links = [
  { route: 'FormatJson', label: 'JSON Format' },
  { route: 'tools', label: 'Base 64 Encode/Decode' },
  { route: 'LoremIpsumGenerator', label: 'Lorem Ipsum' },
  { route: 'JsonToCSV', label: 'JSON to CSV' },
  { route: 'CsvToJson', label: 'CSV to JSON' },
  { route: 'Inspector', label: 'Inspector' },
  { route: 'Dates', label: 'Dates' },
  { route: 'PHPToJson', label: 'PHP To JSON' },
  { route: 'JSONToPHP', label: 'JSON To PHP' },
];
</script>
