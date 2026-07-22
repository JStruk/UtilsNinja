<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
    <Sidebar class="hidden shrink-0 md:flex" />

    <transition name="drawer">
      <div v-if="mobileNavigationOpen" class="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Utility navigation">
        <button type="button" class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Close navigation" @click="closeMobileNavigation"></button>
        <Sidebar mobile class="relative z-10 shadow-2xl" @close="closeMobileNavigation" @navigate="closeMobileNavigation" />
      </div>
    </transition>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Top header for mobile and general actions -->
      <header class="h-16 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 z-20">
        <div class="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            class="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Open navigation"
            :aria-expanded="mobileNavigationOpen"
            @click="mobileNavigationOpen = true"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>
          </button>
          <h1 class="truncate text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">{{ currentPageTitle }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/JStruk/UtilsNinja"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View UtilsNinja on GitHub"
            class="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
        </div>
      </header>
      
      <!-- Content Area -->
      <div class="relative flex-1 overflow-auto p-3 sm:p-6 md:p-8">
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import { findToolByRouteName } from '@/constants/Tools'

const route = useRoute()
const mobileNavigationOpen = ref(false)

function closeMobileNavigation() {
  mobileNavigationOpen.value = false
}

watch(() => route.fullPath, closeMobileNavigation)

const currentPageTitle = computed(() => {
  if (route.name === 'home') return 'Dashboard'

  return findToolByRouteName(route.name)?.label ?? 'UtilsNinja'
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

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}
</style>
