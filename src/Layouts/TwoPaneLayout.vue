<template>
  <div class="relative w-full text-gray-800 flex flex-col sm:flex-row min-h-screen justify-center sm:space-x-2 sm:space-y-0 space-y-2 bg-gray-50 px-2">
    <slot name="left-pane" />
    <slot name="right-pane" />
  </div>
</template>