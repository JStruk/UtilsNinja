<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
    <div class="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      <slot name="left-pane" />
    </div>
    <div class="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      <slot name="right-pane" />
    </div>
  </div>
</template>