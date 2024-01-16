<template>
  <div class="flex">
    <div>
      <div class="font-extrabold text-4xl text-purple-600 transition-all transform"  @click="() => expanded = !expanded">
        <p class="w-5" :class="{'rotate-180 duration-200' : expanded }" >&#10095;</p>
      </div>
      <div class="pt-4 text-center" :class="{'block' : expanded }">
        <h2 class="text-xl underline font-bold text-purple-600"> Tools </h2>
        <ul class="flex border-b pt-2 flex-col">
          <li v-for="(link, index) in links" :key="index" :class="{ '-mb-px mr-1': activeTab === index }" class="mr-1">
            <router-link
                :to="{ name: link.route }"
                :class=" activeTab === index ? 'bg-purple-600 text-white inline-block border-l border-t border-r rounded-t py-2 px-4'
              :
              'bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800'"
                @click="() => setActiveTab(index)"
            >{{ link.label }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>


    <router-view class="p-4 flex-grow"></router-view>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let expanded = ref<boolean>(true)

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
  { route: 'Base64Encode', label: 'Base64 Encode' },
  { route: 'Base64Decode', label: 'Base64 Decode' },
  { route: 'LineSort', label: 'Line Sort' },
  { route: 'ColorConverter', label: 'Color Converter' }
]
</script>
