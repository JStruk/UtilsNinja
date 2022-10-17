<template>
  <div class='h-screen flex justify-center items-center m-auto md:p-12 text-center'>
    <div class="flex flex-col justify-center items-center">
      <div class='flex flex-col md:w-3/4 w-full'>
        <span class='md:text-8xl text-4xl font-semibold text-purple-500 pb-4'> UtilsNinja </span>
        <span class='px-2 md:text-2xl text-lg text-purple-400'> A simple, fast, and accessible grab bag of useful
          utilities
          for
          developers
          to use on the fly. </span>
      </div>
      <div class="p-12">
        <router-link
          class="bg-purple-500 opacity-90 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-full"
          :to="{ name: 'tools' }">View Tools &rarr;
        </router-link>
      </div>
      <hero-svg class="p-12 h-1/4 max-w-lg" />
    </div>

  </div>
</template>

<script lang='ts' setup>
import HeroSvg from "@/components/HeroSvg.vue";

</script>

