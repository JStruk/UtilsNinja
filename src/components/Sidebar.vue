<template>
  <aside
    class="flex flex-col h-screen bg-white dark:bg-slate-900 border-r transition-all duration-300 ease-in-out z-30"
    :class="[expanded ? 'w-64' : 'w-20']"
  >
    <div class="p-6 flex items-center justify-between">
      <router-link :to="{ name: 'home' }" class="flex items-center gap-3 overflow-hidden">
        <div class="min-w-[40px] h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
          U
        </div>
        <span v-if="expanded" class="font-bold text-xl tracking-tight whitespace-nowrap">Utils<span class="text-primary-600">Ninja</span></span>
      </router-link>
    </div>

    <div v-if="expanded" class="px-4 mb-4">
      <label for="tool-search" class="sr-only">Search utilities</label>
      <div class="relative">
        <input
          id="tool-search"
          v-model="searchQuery"
          type="search"
          placeholder="Search tools..."
          class="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all"
        />
        <ToolIcon name="search" class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
      </div>
    </div>

    <nav aria-label="Utilities" class="flex-1 overflow-y-auto px-3 space-y-1 py-4 custom-scrollbar">
      <div v-for="category in filteredCategories" :key="category.name" class="mb-4">
        <h3 v-if="expanded" class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {{ category.name }}
        </h3>
        <div class="space-y-1">
          <router-link
            v-for="tool in category.tools"
            :key="tool.id"
            :to="{ name: tool.routeName }"
            :aria-label="expanded ? undefined : tool.label"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            :class="[
              isActive(tool.routeName)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            ]"
          >
            <ToolIcon :name="tool.icon" class="min-w-[20px] w-5 h-5" />
            <span v-if="expanded" class="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{{ tool.label }}</span>
            <span v-if="!expanded" class="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all whitespace-nowrap z-50 shadow-xl">
              {{ tool.label }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="p-4 border-t space-y-2">
      <button
        type="button"
        :aria-label="isDark ? 'Use light mode' : 'Use dark mode'"
        :aria-pressed="isDark"
        @click="toggleDarkMode"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div class="min-w-[24px] flex items-center justify-center">
          <svg v-if="isDark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41-1.41"/></svg>
          <svg v-else aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </div>
        <span v-if="expanded" class="text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <button
        type="button"
        :aria-label="expanded ? 'Collapse navigation' : 'Expand navigation'"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div class="min-w-[24px] flex items-center justify-center">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="expanded ? 'rotate-180' : ''" class="transition-transform duration-300">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
        <span v-if="expanded" class="text-sm">Collapse</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ToolIcon from '@/components/ToolIcon.vue'
import { toolCategories, tools } from '@/constants/Tools'

defineOptions({ name: 'UtilitySidebar' })

const route = useRoute()
const expanded = ref(true)
const isDark = ref(false)
const searchQuery = ref('')

const isActive = (routeName: string) => route.name === routeName

function readStoredTheme(): string | null {
  try {
    return window.localStorage?.getItem('theme') ?? null
  } catch {
    return null
  }
}

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)

  try {
    window.localStorage?.setItem('theme', isDark.value ? 'dark' : 'light')
  } catch {
    // Theme persistence is optional when storage is unavailable.
  }
}

onMounted(() => {
  const storedTheme = readStoredTheme()
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  isDark.value = storedTheme === 'dark' || (!storedTheme && prefersDark)
  document.documentElement.classList.toggle('dark', isDark.value)
})

const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return toolCategories
    .map((name) => ({
      name,
      tools: tools.filter((tool) => {
        if (tool.category !== name) return false
        if (!query) return true

        return [tool.label, tool.description, tool.path, ...tool.tags]
          .some((value) => value.toLowerCase().includes(query))
      }),
    }))
    .filter((category) => category.tools.length > 0)
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
