<template>
  <TwoPaneLayout>
    <template #left-pane>
      <section class="flex h-full min-h-0 flex-col" :aria-labelledby="`${sourceFormat.toLowerCase()}-input-heading`">
        <div class="border-b bg-white px-5 py-4 dark:bg-slate-900">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Source</p>
              <h2 :id="`${sourceFormat.toLowerCase()}-input-heading`" class="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                {{ sourceFormat }} input
              </h2>
            </div>

            <div class="flex items-center rounded-xl border bg-slate-50 p-1 shadow-inner dark:bg-slate-800/70" aria-label="Conversion direction">
              <button
                type="button"
                :aria-pressed="direction === 'json-to-yaml'"
                class="rounded-lg px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="direction === 'json-to-yaml'
                  ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
                @click="direction = 'json-to-yaml'"
              >
                JSON → YAML
              </button>
              <button
                type="button"
                :aria-pressed="direction === 'yaml-to-json'"
                class="rounded-lg px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="direction === 'yaml-to-json'
                  ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
                @click="direction = 'yaml-to-json'"
              >
                YAML → JSON
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-3 border-b bg-slate-50/70 px-5 py-3 dark:bg-slate-950/20">
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Indentation
            <select
              v-model.number="indent"
              class="rounded-lg border bg-white px-2 py-1.5 text-xs outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800"
              aria-label="Output indentation"
            >
              <option :value="2">2 spaces</option>
              <option :value="4">4 spaces</option>
              <option :value="8">8 spaces</option>
            </select>
          </label>

          <label
            v-if="direction === 'json-to-yaml'"
            class="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            <input
              v-model="arrayAsDocuments"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
            />
            Array items as YAML documents
          </label>

          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              @click="loadSample"
            >
              Use sample
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              @click="input = ''"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="relative min-h-[280px] flex-1 overflow-hidden">
          <label :for="`${sourceFormat.toLowerCase()}-input`" class="sr-only">{{ sourceFormat }} to convert</label>
          <textarea
            :id="`${sourceFormat.toLowerCase()}-input`"
            v-model="input"
            :maxlength="DEFAULT_MAX_INPUT_CHARACTERS"
            :aria-describedby="errorMessage ? 'conversion-error' : 'conversion-safety-note'"
            :aria-invalid="Boolean(errorMessage)"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="sourcePlaceholder"
            class="h-full w-full resize-none bg-transparent p-6 font-mono text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:text-slate-200 dark:placeholder:text-slate-700"
          />
        </div>

        <div id="conversion-safety-note" class="flex flex-wrap items-start gap-x-2 gap-y-1 border-t bg-white px-5 py-3 text-xs leading-5 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span class="min-w-0 flex-1">
            Conversion stays in your browser. YAML uses the safe core schema; input size, nesting, values, and alias expansion are bounded.
          </span>
          <span class="ml-6 whitespace-nowrap font-mono text-[10px] tabular-nums sm:ml-auto">
            {{ input.length.toLocaleString() }} / {{ DEFAULT_MAX_INPUT_CHARACTERS.toLocaleString() }} characters
          </span>
        </div>
      </section>
    </template>

    <template #right-pane>
      <section
        class="flex h-full min-h-0 flex-col"
        :aria-labelledby="`${targetFormat.toLowerCase()}-output-heading`"
        :aria-busy="isConverting"
      >
        <div
          class="border-b px-5 py-4 transition-colors"
          :class="isConverting
            ? 'bg-amber-50/70 dark:bg-amber-950/20'
            : errorMessage
              ? 'bg-rose-50/70 dark:bg-rose-950/20'
              : conversion
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'bg-white dark:bg-slate-900'"
        >
          <div class="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <div class="flex items-center gap-3">
              <span
                class="h-2.5 w-2.5 rounded-full"
                :class="isConverting
                  ? 'animate-pulse bg-amber-500 motion-reduce:animate-none'
                  : errorMessage
                    ? 'bg-rose-500'
                    : conversion
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'"
                aria-hidden="true"
              ></span>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Result</p>
                <h2
                  :id="`${targetFormat.toLowerCase()}-output-heading`"
                  class="mt-1 font-semibold"
                  :class="isConverting
                    ? 'text-amber-700 dark:text-amber-400'
                    : errorMessage
                      ? 'text-rose-700 dark:text-rose-400'
                      : conversion
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-800 dark:text-slate-100'"
                >
                  {{ isConverting ? `Converting ${sourceFormat}…` : errorMessage ? `${sourceFormat} needs attention` : `${targetFormat} output` }}
                </h2>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="conversion && !isConverting"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
                aria-label="Swap output into input and reverse conversion direction"
                @click="swapDirection"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="m7 16-4-4 4-4M3 12h18M17 8l4 4-4 4" />
                </svg>
                Swap
              </button>
              <button
                v-if="conversion && !isConverting"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
                @click="copyOutput"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        </div>

        <div class="relative flex-1 overflow-hidden bg-slate-50/30 dark:bg-slate-950/10">
          <div v-if="isConverting" class="flex h-full min-h-[320px] items-center justify-center p-8 text-center" role="status">
            <div class="max-w-xs">
              <svg class="mx-auto h-8 w-8 animate-spin text-primary-500 motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
                <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
              </svg>
              <p class="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Checking structure and converting…</p>
              <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Conversion begins after a short pause in typing.</p>
            </div>
          </div>

          <div v-else-if="errorMessage" class="h-full overflow-y-auto p-6">
            <div id="conversion-error" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
              <div class="flex items-start gap-3">
                <svg class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <div>
                  <h3 class="font-semibold text-rose-800 dark:text-rose-300">Conversion stopped safely</h3>
                  <p class="mt-1 font-mono text-sm leading-6 text-rose-700 dark:text-rose-400">{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="conversion" class="flex h-full min-h-0 flex-col">
            <div class="flex flex-wrap items-center gap-2 border-b bg-white/70 px-5 py-2.5 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <span class="rounded-md bg-slate-100 px-2 py-1 font-semibold dark:bg-slate-800">{{ documentSummary }}</span>
              <span class="rounded-md bg-slate-100 px-2 py-1 font-semibold dark:bg-slate-800">{{ indent }}-space indent</span>
              <span v-if="conversion.warnings.length" class="rounded-md bg-amber-100 px-2 py-1 font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {{ conversion.warnings.length }} warning{{ conversion.warnings.length === 1 ? '' : 's' }}
              </span>
            </div>

            <div v-if="conversion.warnings.length" class="border-b border-amber-200 bg-amber-50/70 px-5 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <ul class="list-disc space-y-1 pl-4 text-xs leading-5 text-amber-800 dark:text-amber-300">
                <li v-for="warning in conversion.warnings" :key="warning">{{ warning }}</li>
              </ul>
            </div>

            <label :for="`${targetFormat.toLowerCase()}-output`" class="sr-only">Converted {{ targetFormat }} output</label>
            <textarea
              :id="`${targetFormat.toLowerCase()}-output`"
              :value="conversion.output"
              readonly
              spellcheck="false"
              class="min-h-0 flex-1 resize-none bg-transparent p-6 font-mono text-sm leading-6 text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:text-slate-200"
            />
          </div>

          <div v-else class="flex h-full min-h-[320px] items-center justify-center p-8 text-center">
            <div class="max-w-xs">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 text-slate-400 dark:border-slate-700 dark:bg-slate-900/50">
                <span class="font-mono text-lg font-bold">{ }</span>
              </div>
              <p class="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Ready to transform</p>
              <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Enter {{ sourceFormat }} on the left to produce formatted {{ targetFormat }}.</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </TwoPaneLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import {
  convertJSONYAML,
  DEFAULT_MAX_DEPTH,
  DEFAULT_MAX_INPUT_CHARACTERS,
  DEFAULT_MAX_NODES,
  type JSONYAMLConversionResult,
  type JSONYAMLDirection,
} from '@/utilities/JSONYAMLConverter'

const CONVERSION_DEBOUNCE_MS = 250

const JSON_SAMPLE = `{
  "service": "utils-ninja",
  "enabled": true,
  "ports": [4173, 8080],
  "owner": {
    "name": "Ninja Developer",
    "team": "platform"
  }
}`

const YAML_SAMPLE = `---
service: utils-ninja
environment: production
replicas: 3
---
service: utils-ninja-worker
environment: production
replicas: 2`

const direction = ref<JSONYAMLDirection>('json-to-yaml')
const input = ref(JSON_SAMPLE)
const indent = ref(2)
const arrayAsDocuments = ref(false)
const conversion = ref<JSONYAMLConversionResult | null>(null)
const errorMessage = ref('')
const isConverting = ref(false)
let conversionTimer: ReturnType<typeof setTimeout> | undefined

const sourceFormat = computed(() => direction.value === 'json-to-yaml' ? 'JSON' : 'YAML')
const targetFormat = computed(() => direction.value === 'json-to-yaml' ? 'YAML' : 'JSON')
const sourcePlaceholder = computed(() => direction.value === 'json-to-yaml'
  ? '{\n  "name": "UtilsNinja"\n}'
  : 'name: UtilsNinja\nenabled: true')

const documentSummary = computed(() => {
  if (!conversion.value) return ''
  const inputCount = conversion.value.inputDocumentCount
  const outputCount = conversion.value.outputDocumentCount
  const inputLabel = `${inputCount} ${sourceFormat.value} document${inputCount === 1 ? '' : 's'}`
  const outputLabel = `${outputCount} ${targetFormat.value} document${outputCount === 1 ? '' : 's'}`
  return `${inputLabel} → ${outputLabel}`
})

watch([input, direction, indent, arrayAsDocuments], scheduleConversion, { immediate: true })

onBeforeUnmount(() => {
  if (conversionTimer !== undefined) clearTimeout(conversionTimer)
})

function scheduleConversion() {
  if (conversionTimer !== undefined) clearTimeout(conversionTimer)
  conversionTimer = undefined
  conversion.value = null
  errorMessage.value = ''

  if (!input.value.trim()) {
    isConverting.value = false
    return
  }

  isConverting.value = true
  conversionTimer = setTimeout(convert, CONVERSION_DEBOUNCE_MS)
}

function convert() {
  conversionTimer = undefined

  if (!input.value.trim()) {
    conversion.value = null
    errorMessage.value = ''
    isConverting.value = false
    return
  }

  try {
    conversion.value = convertJSONYAML(input.value, direction.value, {
      indent: indent.value,
      arrayAsDocuments: arrayAsDocuments.value,
      maxAliasCount: 50,
      maxInputCharacters: DEFAULT_MAX_INPUT_CHARACTERS,
      maxNodes: DEFAULT_MAX_NODES,
      maxDepth: DEFAULT_MAX_DEPTH,
    })
    errorMessage.value = ''
  } catch (error) {
    conversion.value = null
    errorMessage.value = error instanceof Error ? error.message : `${sourceFormat.value} could not be converted safely.`
  } finally {
    isConverting.value = false
  }
}

function loadSample() {
  input.value = direction.value === 'json-to-yaml' ? JSON_SAMPLE : YAML_SAMPLE
}

function swapDirection() {
  if (!conversion.value) return
  const nextInput = conversion.value.output
  direction.value = direction.value === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml'
  input.value = nextInput
}

function copyOutput() {
  if (!conversion.value) return
  copyToClipboard(conversion.value.output)
  toast.success(`${targetFormat.value} copied to clipboard`, { autoClose: 2000 })
}
</script>
