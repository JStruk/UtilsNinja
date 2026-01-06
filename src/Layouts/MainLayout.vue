<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
    <Sidebar />
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Top header for mobile and general actions -->
      <header class="h-16 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ currentPageTitle }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/JStruk/UtilsNinja"
            target="_blank"
            class="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
        </div>
      </header>
      
      <!-- Content Area -->
      <div class="flex-1 overflow-auto p-6 md:p-8 relative">
        <transition
          name="fade"
          mode="out-in"
        >
          <slot></slot>
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'

const route = useRoute()

const currentPageTitle = computed(() => {
  if (route.name === 'home') return 'Dashboard'
  
  // Try to find label in some registry or just use name
  const names: Record<string, string> = {
    'FormatJSON': 'JSON Formatter',
    'LoremIpsumGenerator': 'Lorem Ipsum Generator',
    'JSONToCSV': 'JSON to CSV',
    'CSVToJSON': 'CSV to JSON',
    'PHPToJSON': 'PHP to JSON',
    'JSONToPHP': 'JSON to PHP',
    'Inspector': 'String Inspector',
    'Dates': 'Timestamp Converter',
    'Base64Encode': 'Base64 Encode',
    'Base64Decode': 'Base64 Decode',
    'LineSort': 'Line Sorter',
    'ColorConverter': 'Color Converter'
  }
  
  return names[route.name as string] || (route.name as string)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
