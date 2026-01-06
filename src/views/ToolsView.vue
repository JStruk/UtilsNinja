<template>
  <div class="hidden md:flex relative min-h-screen justify-center overflow-hidden bg-[#EDEDED] dark:bg-gray-900">
    <div
        class="flex flex-col pt-12 bg-slate-300 bg-opacity-50 text-center overflow-hidden transition-all duration-500 ease-in-out dark:bg-gray-800 dark:bg-opacity-80 dark:text-purple-200"
        :class="expanded ? 'w-80 px-6' : 'w-0'"
    >
      <h2 class="font-semibold underline p-4 text-4xl text-purple-700 dark:text-purple-300">Tools</h2>
      <ul class="text-xl md:w-64">
        <li v-for="(link, index) in links"
            :key="index"
            class="p-1 px-4 font-bold"
            :class="activeTab === index ? 'bg-purple-600 text-white dark:bg-purple-800 dark:text-yellow-200' : index % 2 === 0 ? 'bg-slate-100 text-purple-600 dark:bg-gray-900 dark:text-purple-200' : 'bg-slate-200 text-purple-600 dark:bg-gray-800 dark:text-purple-200'"
        >
          <router-link :to="{ name: link.route }" @click="() => setActiveTab(index)">
            <p v-html="link.label"/>
          </router-link>
        </li>
      </ul>
    </div>
    <div
        class="bg-slate-300 bg-opacity-50 p-2 text-purple-700 dark:bg-gray-800 dark:bg-opacity-80 dark:text-purple-200"
        :title="expanded ? 'collapse' : 'expand'"
        @click="() => expanded = !expanded"
    >
      <p class="text-4xl" :class="expanded ? 'rotate-180' : ''">&#10095;</p>
    </div>
    <div class="flex-1 bg-slate-100 overflow-scroll dark:bg-gray-700">
      <router-view/>
    </div>
  </div>

    <div class="md:hidden flex flex-col items-center text-slate-100 space-y-4 dark:bg-gray-900" :class="{ 'py-12': isMainToolsPage }">
      <div
          v-show="isMainToolsPage"
          v-for="(link, index) in links"
          :key="index"
          @click="() => setActiveTab(index)"
          class="h-28 w-3/4 bg-purple-700 flex items-center justify-center text-center dark:bg-purple-900 dark:text-yellow-200"
      >
        <router-link :to="{ name: link.route }">
          <p v-html="link.label"/>
        </router-link>
      </div>
      <router-view/>
    </div>

</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from 'vue'
import { useRoute } from 'vue-router'

const activeTab = ref()
const expanded = ref<boolean>(true)
const isMainToolsPage = ref<boolean>(true)
const route = useRoute()

const updateIsMainToolsPage = () => {
  isMainToolsPage.value = route.path === '/tools'
  setActiveTab(links.findIndex((link) => route.path.includes(link.path)))
}
onMounted(updateIsMainToolsPage)
onUpdated(updateIsMainToolsPage)

const setActiveTab = (tabNumber: number) => {
  activeTab.value = tabNumber
}

const links = [
  { route: 'FormatJSON', label: 'JSON Formatter', path: '/json-formatter' },
  { route: 'LoremIpsumGenerator', label: 'Lorem Ipsum Generator', path: '/lig' },
  { route: 'JSONToCSV', label: 'JSON &#10140; CSV', path: '/json-to-csv' },
  { route: 'CSVToJSON', label: 'CSV &#10140; JSON', path:'/csv-to-json' },
  { route: 'PHPToJSON', label: 'PHP &#10140; JSON', path: '/php-to-json' },
  { route: 'JSONToPHP', label: 'JSON &#10140; PHP', path: '/json-to-php' },
  { route: 'Inspector', label: 'String Inspector', path: '/inspector' },
  { route: 'Dates', label: 'Timestamp Converter', path: '/dates' },
  { route: 'Base64Encode', label: 'Base64 Encode', path: '/base-64-encode' },
  { route: 'Base64Decode', label: 'Base64 Decode', path: '/base-64-decode' },
  { route: 'LineSort', label: 'Line Sorter', path: '/line-sort' },
  { route: 'ColorConverter', label: 'Color Converter', path: '/color-converter' }
]
</script>
