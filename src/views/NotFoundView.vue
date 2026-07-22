<template>
  <section class="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 text-center" aria-labelledby="not-found-heading">
    <div>
      <p class="font-mono text-sm font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-400">404 · Route not found</p>
      <h2 id="not-found-heading" class="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">This path has no utility.</h2>
      <p class="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-500 dark:text-slate-400">
        The link may be stale, or the utility may have moved into a different workbench.
      </p>
      <router-link
        :to="{ name: 'home' }"
        class="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      >
        Browse all utilities
      </router-link>
    </div>
  </section>
</template>
