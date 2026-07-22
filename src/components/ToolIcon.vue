<template>
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
  >
    <path v-for="path in paths" :key="path" :d="path" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToolIconName } from '@/constants/Tools'

const props = defineProps<{
  name: ToolIconName
}>()

const iconPaths: Record<ToolIconName, string[]> = {
  braces: ['M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2', 'M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2'],
  calendar: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20', 'M12 6v6l4 2'],
  code: ['m8 9-4 3 4 3', 'm16 9 4 3-4 3', 'm14 5-4 14'],
  data: ['M4 5h16v14H4z', 'M4 10h16', 'M10 5v14'],
  diff: ['M5 4v16', 'M19 4v16', 'M9 8h6', 'M9 12h4', 'M9 16h6'],
  'file-code': ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'm10 13-2 2 2 2', 'm14 13 2 2-2 2'],
  hash: ['M5 9h14', 'M4 15h14', 'M10 3 8 21', 'M16 3l-2 18'],
  key: ['M21 2 13.6 9.4', 'M15 5l4 4', 'M9.5 8A5.5 5.5 0 1 0 16 14.5 5.5 5.5 0 0 0 9.5 8'],
  link: ['M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1', 'M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  network: ['M12 3v6', 'M5 21v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4', 'M5 21h.01', 'M12 21h.01', 'M19 21h.01', 'M12 9h.01'],
  palette: ['M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0-3-10', 'M7.5 10h.01', 'M9.5 6.5h.01', 'M14.5 6.5h.01', 'M17 10h.01'],
  qr: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h3v3h-3z', 'M19 14h2v2', 'M19 19h2v2', 'M14 19h2v2'],
  regex: ['M4 17c2-7 4-10 7-10 2 0 3 2 3 4 0 3-2 6-5 6-2 0-3-1-3-3', 'M17 7v4', 'M15 9h4'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16', 'm21 21-4.3-4.3'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10', 'm9 12 2 2 4-4'],
  sort: ['M8 6h12', 'M8 12h8', 'M8 18h4', 'm3 4 2-2 2 2', 'M5 2v18', 'm3 18 2 2 2-2'],
  terminal: ['m4 17 6-6-6-6', 'M12 19h8'],
  text: ['M4 6V4h16v2', 'M9 20h6', 'M12 4v16'],
  unlock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 7.5-2'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  validation: ['M4 4h16v16H4z', 'm8 12 2.5 2.5L16 9'],
}

const paths = computed(() => iconPaths[props.name])
</script>
