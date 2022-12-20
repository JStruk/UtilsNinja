<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col h-screen">
    <header>
      <menu-bar/>
    </header>

    <RouterView/>
  </div>
</template>

<script setup>
import MenuBar from './components/MenuBar.vue'
</script>
