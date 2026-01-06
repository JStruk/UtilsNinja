<template>
  <aside
    class="flex flex-col h-screen bg-white dark:bg-slate-900 border-r transition-all duration-300 ease-in-out z-30"
    :class="[expanded ? 'w-64' : 'w-20']"
  >
    <!-- Logo area -->
    <div class="p-6 flex items-center justify-between">
      <router-link :to="{ name: 'home' }" class="flex items-center gap-3 overflow-hidden">
        <div class="min-w-[40px] h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
          U
        </div>
        <span v-if="expanded" class="font-bold text-xl tracking-tight whitespace-nowrap">Utils<span class="text-primary-600">Ninja</span></span>
      </router-link>
    </div>

    <!-- Search / Filter -->
    <div v-if="expanded" class="px-4 mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tools..."
          class="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all"
        />
        <span class="absolute left-3 top-2.5 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
      </div>
    </div>

    <!-- Nav Links -->
    <nav class="flex-1 overflow-y-auto px-3 space-y-1 py-4 custom-scrollbar">
      <div v-for="category in filteredCategories" :key="category.name" class="mb-4">
        <h3 v-if="expanded" class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {{ category.name }}
        </h3>
        <div class="space-y-1">
          <router-link
            v-for="tool in category.tools"
            :key="tool.route"
            :to="{ name: tool.route }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative"
            :class="[
              isActive(tool.route)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            ]"
          >
            <div class="min-w-[24px] flex items-center justify-center">
               <component :is="tool.icon" class="w-5 h-5" />
            </div>
            <span v-if="expanded" class="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{{ tool.label }}</span>
            
            <!-- Tooltip for collapsed state -->
            <div v-if="!expanded" class="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
               {{ tool.label }}
            </div>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer / Toggle -->
    <div class="p-4 border-t space-y-2">
      <button
        @click="toggleDarkMode"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
      >
        <div class="min-w-[24px] flex items-center justify-center">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </div>
        <span v-if="expanded" class="text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <button
        @click="expanded = !expanded"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
      >
        <div class="min-w-[24px] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="expanded ? 'rotate-180' : ''"
            class="transition-transform duration-300"
          >
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
        <span v-if="expanded" class="text-sm">Collapse</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const expanded = ref(true)
const isDark = ref(false)
const searchQuery = ref('')

const isActive = (routeName: string) => route.name === routeName

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark.value)
})

const categories = [
  {
    name: 'JSON & Data',
    tools: [
      { route: 'FormatJSON', label: 'JSON Formatter', icon: 'svg-json' },
      { route: 'JSONToCSV', label: 'JSON to CSV', icon: 'svg-data' },
      { route: 'CSVToJSON', label: 'CSV to JSON', icon: 'svg-data' },
      { route: 'PHPToJSON', label: 'PHP to JSON', icon: 'svg-code' },
      { route: 'JSONToPHP', label: 'JSON to PHP', icon: 'svg-code' },
  {
    name: 'Dev Tools',
    tools: [
      { route: 'CurlToFetch', label: 'cURL to Fetch', icon: 'svg-terminal' },
      { route: 'HttpStatusCodes', label: 'HTTP Status Codes', icon: 'svg-list' },
    ]
  },
  {
    name: 'Encoding',
    tools: [
      { route: 'Base64Encode', label: 'Base64 Encode', icon: 'svg-lock' },
      { route: 'Base64Decode', label: 'Base64 Decode', icon: 'svg-unlock' },
    ]
  },
  {
    name: 'Text & Utilities',
    tools: [
      { route: 'Inspector', label: 'String Inspector', icon: 'svg-search' },
      { route: 'LineSort', label: 'Line Sorter', icon: 'svg-sort' },
      { route: 'LoremIpsumGenerator', label: 'Lorem Ipsum', icon: 'svg-text' },
      { route: 'Dates', label: 'Timestamp Converter', icon: 'svg-clock' },
      { route: 'ColorConverter', label: 'Color Converter', icon: 'svg-palette' },
    ]
  }
]

// Simple SVG Icons as components
const svgJson = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2-2v-2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>' }
const svgData = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M3 6v12"/><path d="M21 6v12"/><path d="M12 6v12"/></svg>' }
const svgCode = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' }
const svgLock = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' }
const svgUnlock = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>' }
const svgSearch = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' }
const svgSort = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/></svg>' } // Oops, that's not sort, let's fix
const svgSortFix = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-3 3-3-3"/><path d="M12 3v18"/><path d="m9 6 3-3 3 3"/></svg>' }
const svgText = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>' }
const svgClock = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' }
const svgPalette = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.32 2.26-.88.5-.5.74-1.18.74-1.83 0-1.5 1.2-2.7 2.7-2.7.65 0 1.33.24 1.83.74.56.56 1.34.88 2.26.88 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>' }
const svgTerminal = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>' }
const svgList = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>' }
const svgUsers = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' }

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories
  
  const query = searchQuery.value.toLowerCase()
  return categories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => tool.label.toLowerCase().includes(query))
  })).filter(cat => cat.tools.length > 0)
})

</script>

<style scoped>
@reference "tailwindcss";

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 dark:bg-slate-700 rounded-full;
}
</style>
