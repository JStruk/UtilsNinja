<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col min-h-screen w-full bg-white dark:bg-gray-950 dark:text-gray-100">
    <header class="bg-white dark:bg-gray-950 dark:text-gray-100">
      <menu-bar/>
    </header>
    <main class="flex-1 bg-white dark:bg-gray-800 dark:text-purple-700">
      <RouterView/>
    </main>
  </div>
</template>

<script setup>
import MenuBar from './components/MenuBar.vue'
</script>
