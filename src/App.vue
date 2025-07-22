<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col h-screen bg-white dark:bg-gray-950 dark:text-gray-100">
    <header>
      <menu-bar/>
    </header>

    <RouterView/>
  </div>
</template>

<script setup>
import MenuBar from './components/MenuBar.vue'
</script>
