<template>
  <div class="max-w-6xl mx-auto">
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to UtilsNinja</h2>
      <p class="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">{{ slogan }}</p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="tool in featuredTools"
        :key="tool.route"
        :to="{ name: tool.route }"
        class="group p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/30 transition-all duration-300"
      >
        <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform">
           <component :is="tool.icon" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {{ tool.label }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {{ tool.description }}
        </p>
      </router-link>
    </div>
    
    <div class="mt-16 p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-soft">
      <div class="max-w-xl text-center md:text-left">
        <h3 class="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Open Source & Free Forever</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6 font-medium">UtilsNinja is built by developers, for developers. All tools run locally in your browser for maximum privacy and performance.</p>
        <a href="https://github.com/JStruk/UtilsNinja" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-400 transition-all shadow-md shadow-primary-500/20 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          Contribute on GitHub
        </a>
      </div>
      <HeroSvg class="w-full max-w-[280px] text-primary-600 dark:text-primary-400 opacity-20 md:opacity-100" />
    </div>
  </div>
</template>

<script lang='ts' setup>
import HeroSvg from '@/components/HeroSvg.vue'
import { slogan } from '@/constants/Constants'

const featuredTools = [
  { 
    route: 'FormatJSON', 
    label: 'JSON Formatter', 
    description: 'Clean, format, and validate your JSON data with ease.',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2-2v-2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>' }
  },
  { 
    route: 'Base64Encode', 
    label: 'Base64 Encode', 
    description: 'Securely encode text into Base64 format.',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' }
  },
  { 
    route: 'Dates', 
    label: 'Timestamp Converter', 
    description: 'Convert Unix timestamps to human-readable dates.',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' }
  },
  { 
    route: 'QRCodeGenerator', 
    label: 'QR Code Generator', 
    description: 'Create customizable QR codes for URLs, text, and more.',
    icon: { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>' }
  }
]
</script>

