<template>
  <ul class="flex border-b pt-6">
    <li :class="{ '-mb-px mr-1': activeTab === 0 }" class="mr-1">
      <router-link
        :class="{ 'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab === 0 }"
        class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
        @click="() => setActiveTab(0)"
        :to="{ name: 'tools' }"
        >JSON Format</router-link
      >
    </li>
    <li :class="{ '-mb-px mr-1': activeTab === 1 }" class="mr-1">
      <router-link
        :class="{ 'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab === 1 }"
        class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
        @click="() => setActiveTab(1)"
        :to="{ name: 'tools' }"
        >Base 64 Encode/Decode</router-link
      >
    </li>
    <li :class="{ '-mb-px mr-1': activeTab === 2 }" class="mr-1">
      <router-link
        :class="{ 'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab === 2 }"
        class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
        @click="() => setActiveTab(2)"
        :to="{ name: 'LoremIpsumGenerator' }"
        >Lorem Ipsum</router-link
      >
    </li>
    <li :class="{ '-mb-px mr-1': activeTab === 3 }" class="mr-1">
      <router-link
        :class="{ 'bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700': activeTab === 3 }"
        class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800"
        @click="() => setActiveTab(3)"
        :to="{ name: 'tools' }"
        >JSON to CSV</router-link
      >
    </li>
  </ul>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { ref } from "vue";

let activeTab = ref(0);

const setActiveTab = (tabNumber: number) => {
  activeTab.value = tabNumber;
};
</script>
