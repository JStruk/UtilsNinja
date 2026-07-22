<template>
  <div class="h-full min-h-0">
    <TwoPaneLayout>
      <template #left-pane>
        <section class="flex h-full min-h-0 flex-col" aria-labelledby="schema-validator-heading">
          <header class="border-b border-slate-100 bg-slate-950 p-5 dark:border-slate-800">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="mb-1 flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50"></span>
                    <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
                  </span>
                  <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">Contract check</p>
                </div>
                <h2 id="schema-validator-heading" class="text-lg font-bold text-white">JSON Schema Validator</h2>
                <p class="mt-1 text-sm text-slate-400">Draft 2020-12 · common formats · local references only</p>
              </div>
              <button
                type="button"
                class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                @click="loadExample(false)"
              >
                Reset example
              </button>
            </div>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto p-5">
            <section aria-labelledby="schema-editor-heading">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 id="schema-editor-heading" class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Schema JSON</h3>
                  <p class="mt-0.5 text-[11px] text-slate-400">{{ schemaText.length.toLocaleString() }} / {{ SCHEMA_CHARACTER_LIMIT.toLocaleString() }} characters</p>
                </div>
                <button type="button" class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline" @click="formatEditor('schema')">Format schema</button>
              </div>
              <textarea
                id="schema-json-input"
                v-model="schemaText"
                spellcheck="false"
                :maxlength="SCHEMA_CHARACTER_LIMIT"
                class="h-64 w-full resize-y rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-cyan-100 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700"
                aria-labelledby="schema-editor-heading"
                placeholder="Paste a draft 2020-12 JSON Schema"
              ></textarea>
            </section>

            <section aria-labelledby="data-editor-heading">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 id="data-editor-heading" class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Data JSON</h3>
                  <p class="mt-0.5 text-[11px] text-slate-400">{{ dataText.length.toLocaleString() }} / {{ DATA_CHARACTER_LIMIT.toLocaleString() }} characters</p>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" class="text-xs font-semibold text-slate-400 transition hover:text-emerald-600 focus:outline-none focus:underline" @click="loadExample(true)">Valid sample</button>
                  <button type="button" class="text-xs font-semibold text-slate-400 transition hover:text-rose-600 focus:outline-none focus:underline" @click="loadInvalidData">Invalid sample</button>
                  <button type="button" class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline" @click="formatEditor('data')">Format data</button>
                </div>
              </div>
              <textarea
                id="data-json-input"
                v-model="dataText"
                spellcheck="false"
                :maxlength="DATA_CHARACTER_LIMIT"
                class="h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
                aria-labelledby="data-editor-heading"
                placeholder="Paste JSON data to validate"
              ></textarea>
            </section>

            <fieldset class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/30">
              <legend class="px-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Validation options</legend>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="flex cursor-pointer items-start gap-3">
                  <input v-model="allErrors" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                  <span>
                    <span class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Collect all errors</span>
                    <span class="mt-0.5 block text-xs leading-5 text-slate-400">Otherwise validation stops at the first failing keyword.</span>
                  </span>
                </label>
                <label class="flex cursor-pointer items-start gap-3">
                  <input v-model="strictDiagnostics" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                  <span>
                    <span class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Strict diagnostics</span>
                    <span class="mt-0.5 block text-xs leading-5 text-slate-400">Warn about ignored or ambiguous schema constructs.</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div class="grid gap-3 sm:grid-cols-3" aria-label="Validator safeguards">
              <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Network</p>
                <p class="mt-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200">Remote $ref disabled</p>
              </div>
              <div class="rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900/60 dark:bg-sky-950/30">
                <p class="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Formats</p>
                <p class="mt-1 text-xs font-semibold text-sky-900 dark:text-sky-200">Email, URI, UUID, date…</p>
              </div>
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Isolation</p>
                <p class="mt-1 text-xs font-semibold text-amber-900 dark:text-amber-200">{{ VALIDATION_TIMEOUT_MS / 1000 }} s worker limit</p>
              </div>
            </div>

            <p v-if="editorMessage" class="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">{{ editorMessage }}</p>
          </div>

          <footer class="flex items-center justify-between gap-4 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p class="min-w-0 text-xs text-slate-400">Runs locally in a disposable worker; input values are never mutated.</p>
            <button
              type="button"
              class="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:cursor-wait disabled:opacity-70"
              :disabled="isValidating"
              @click="runValidation"
            >
              <span v-if="isValidating" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true"></span>
              {{ isValidating ? 'Validating…' : 'Validate JSON' }}
            </button>
          </footer>
        </section>
      </template>

      <template #right-pane>
        <section class="flex h-full min-h-0 flex-col" aria-labelledby="validation-results-heading" :aria-busy="isValidating">
          <header class="border-b border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Validation report</p>
                <h2 id="validation-results-heading" class="text-lg font-bold text-slate-900 dark:text-white">{{ resultHeading }}</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ resultDescription }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="rounded-full px-3 py-1.5 text-xs font-bold" :class="resultStatusClasses">{{ resultStatus }}</span>
                <span v-if="lastDuration !== null" class="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ lastDuration }} ms</span>
              </div>
            </div>

            <div v-if="result" class="mt-4 grid grid-cols-3 gap-2">
              <div class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schema</p>
                <p class="mt-1 text-sm font-bold" :class="result.schemaValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">{{ result.schemaValid ? 'Ready' : 'Invalid' }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Errors</p>
                <p class="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400">{{ result.errorCount }}{{ result.errorsTruncated ? '+' : '' }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warnings</p>
                <p class="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">{{ result.warningCount }}</p>
              </div>
            </div>
          </header>

          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <div class="flex gap-1" aria-label="Diagnostic filter">
              <button
                v-for="filter in diagnosticFilters"
                :key="filter.value"
                type="button"
                class="rounded-lg px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-primary-500"
                :class="diagnosticFilter === filter.value ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'"
                :aria-pressed="diagnosticFilter === filter.value"
                @click="diagnosticFilter = filter.value"
              >
                {{ filter.label }}
              </button>
            </div>
            <button
              type="button"
              :disabled="!result"
              class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-40"
              @click="copyReport"
            >
              Copy report
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5">
            <div v-if="isValidating && !result" class="flex h-full min-h-64 items-center justify-center" aria-live="polite">
              <div class="text-center">
                <span class="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" aria-hidden="true"></span>
                <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Compiling schema and checking data…</p>
              </div>
            </div>

            <div v-else-if="unexpectedError" class="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
              <p class="font-bold">Validator could not complete</p>
              <p class="mt-1 text-sm">{{ unexpectedError }}</p>
            </div>

            <div v-else-if="!result" class="flex h-full min-h-64 items-center justify-center">
              <div class="max-w-sm text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-slate-300 font-mono text-xl text-slate-400 dark:border-slate-700">{ }</div>
                <p class="font-bold text-slate-700 dark:text-slate-200">No report yet</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Edit either JSON document or choose Validate JSON.</p>
              </div>
            </div>

            <div v-else-if="result.valid && filteredDiagnostics.length === 0" class="flex h-full min-h-64 items-center justify-center">
              <div class="max-w-md text-center">
                <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 ring-8 ring-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-950/20" aria-hidden="true">✓</div>
                <p class="text-xl font-bold text-slate-900 dark:text-white">Data satisfies the schema</p>
                <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">All required fields, types, constraints, and configured formats passed.</p>
              </div>
            </div>

            <template v-else>
              <div v-if="result.errorsTruncated" class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                The report reached its {{ MAX_DISPLAYED_ERRORS }}-error display limit. Fix these issues and validate again to reveal any remaining errors.
              </div>

              <div v-if="filteredDiagnostics.length" class="space-y-3">
                <article
                  v-for="(diagnostic, index) in filteredDiagnostics"
                  :key="`${diagnostic.kind}-${diagnostic.instancePath}-${diagnostic.keyword}-${index}`"
                  class="overflow-hidden rounded-xl border bg-white dark:bg-slate-900"
                  :class="diagnostic.severity === 'error' ? 'border-rose-200 dark:border-rose-900/60' : 'border-amber-200 dark:border-amber-900/60'"
                >
                  <div class="flex items-start gap-3 p-4">
                    <span
                      class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                      :class="diagnostic.severity === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'"
                      aria-hidden="true"
                    >{{ diagnostic.severity === 'error' ? '!' : '△' }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="mb-1 flex flex-wrap items-center gap-2">
                        <code class="break-all text-sm font-bold text-slate-800 dark:text-slate-100">{{ diagnostic.displayPath }}</code>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ diagnostic.source }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ diagnostic.keyword }}</span>
                      </div>
                      <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">{{ diagnostic.message }}</p>
                      <p v-if="diagnostic.line && diagnostic.column" class="mt-1 font-mono text-xs text-slate-400">Line {{ diagnostic.line }}, column {{ diagnostic.column }}</p>
                    </div>
                  </div>
                  <details v-if="diagnostic.schemaPath || Object.keys(diagnostic.params).length" class="border-t border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/30">
                    <summary class="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-500 outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:text-slate-400">Technical details</summary>
                    <div class="space-y-2 px-4 pb-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      <p v-if="diagnostic.schemaPath" class="break-all"><span class="font-bold">Schema path:</span> {{ diagnostic.schemaPath }}</p>
                      <pre v-if="Object.keys(diagnostic.params).length" class="overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-3 dark:bg-slate-800">{{ JSON.stringify(diagnostic.params, null, 2) }}</pre>
                    </div>
                  </details>
                </article>
              </div>

              <div v-else class="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center dark:border-slate-700">
                <p class="font-bold text-slate-700 dark:text-slate-200">No {{ diagnosticFilter }} diagnostics</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose another filter to inspect the rest of the report.</p>
              </div>
            </template>
          </div>

          <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
        </section>
      </template>
    </TwoPaneLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import type {
  SchemaDiagnostic,
  SchemaValidationResult,
  SchemaValidationWorkerRequest,
  SchemaValidationWorkerResponse,
} from '@/utilities/JSONSchemaValidator'

type DiagnosticFilter = 'all' | 'errors' | 'warnings'
type EditorSource = 'schema' | 'data'

const AUTO_VALIDATE_DELAY_MS = 450
const VALIDATION_TIMEOUT_MS = 1_500
const SCHEMA_CHARACTER_LIMIT = 250_000
const DATA_CHARACTER_LIMIT = 1_000_000
const MAX_DISPLAYED_ERRORS = 200
const EXAMPLE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Developer profile',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    role: { enum: ['admin', 'developer', 'viewer'] },
    createdAt: { type: 'string', format: 'date-time' },
    preferences: { $ref: '#/$defs/preferences' },
  },
  required: ['id', 'email', 'role'],
  additionalProperties: false,
  $defs: {
    preferences: {
      type: 'object',
      properties: { theme: { enum: ['light', 'dark', 'system'] } },
      required: ['theme'],
      additionalProperties: false,
    },
  },
}
const VALID_DATA = {
  id: '2f1c9554-5b3c-4a2d-aeed-d13943585ea4',
  email: 'ninja@example.com',
  role: 'developer',
  createdAt: '2026-07-22T16:00:00Z',
  preferences: { theme: 'dark' },
}
const INVALID_DATA = {
  id: 'not-a-uuid',
  email: 'not-an-email',
  role: 'owner',
  createdAt: 'next Tuesday',
  preferences: { theme: 'neon', debug: true },
  extra: true,
}

const schemaText = ref(JSON.stringify(EXAMPLE_SCHEMA, null, 2))
const dataText = ref(JSON.stringify(INVALID_DATA, null, 2))
const allErrors = ref(true)
const strictDiagnostics = ref(true)
const result = ref<SchemaValidationResult | null>(null)
const isValidating = ref(false)
const unexpectedError = ref('')
const editorMessage = ref('')
const liveMessage = ref('')
const lastDuration = ref<number | null>(null)
const diagnosticFilter = ref<DiagnosticFilter>('all')
const diagnosticFilters: Array<{ value: DiagnosticFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'errors', label: 'Errors' },
  { value: 'warnings', label: 'Warnings' },
]

let debounceTimeout: number | undefined
let workerTimeout: number | undefined
let activeWorker: Worker | null = null
let validationGeneration = 0

const filteredDiagnostics = computed<SchemaDiagnostic[]>(() => {
  if (!result.value) return []
  if (diagnosticFilter.value === 'errors') {
    return result.value.diagnostics.filter(diagnostic => diagnostic.severity === 'error')
  }
  if (diagnosticFilter.value === 'warnings') {
    return result.value.diagnostics.filter(diagnostic => diagnostic.severity === 'warning')
  }
  return result.value.diagnostics
})

const resultHeading = computed(() => {
  if (unexpectedError.value) return 'Validation stopped safely'
  if (!result.value) return 'Waiting for input'
  if (result.value.valid) return result.value.warningCount ? 'Valid with warnings' : 'Schema contract satisfied'
  if (!result.value.schemaValid) return 'Schema needs attention'
  if (result.value.dataValid === null) return 'Data JSON needs attention'
  return 'Data violates the schema'
})

const resultDescription = computed(() => {
  if (unexpectedError.value) return unexpectedError.value
  if (!result.value) return 'Validation runs automatically after a short pause.'
  if (result.value.valid) return 'The JSON instance passes every active constraint.'
  if (!result.value.schemaValid) return 'Fix schema parsing, references, or schema-definition errors first.'
  if (result.value.dataValid === null) return 'The schema is ready, but the data could not be parsed or exceeded a safety bound.'
  return 'Each diagnostic identifies the failing instance path and schema keyword.'
})

const resultStatus = computed(() => {
  if (isValidating.value) return 'Validating'
  if (unexpectedError.value) return 'Stopped'
  if (!result.value) return 'Waiting'
  if (result.value.valid) return 'Valid'
  if (!result.value.schemaValid) return 'Schema error'
  return result.value.dataValid === null ? 'JSON error' : 'Invalid'
})

const resultStatusClasses = computed(() => {
  if (isValidating.value) return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
  if (unexpectedError.value) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
  if (!result.value) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  if (result.value.valid) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
  return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
})

function terminateValidationWorker(): void {
  activeWorker?.terminate()
  activeWorker = null

  if (workerTimeout !== undefined) {
    window.clearTimeout(workerTimeout)
    workerTimeout = undefined
  }
}

function runValidation(): void {
  if (debounceTimeout !== undefined) {
    window.clearTimeout(debounceTimeout)
    debounceTimeout = undefined
  }

  terminateValidationWorker()
  const generation = ++validationGeneration
  isValidating.value = true
  unexpectedError.value = ''
  editorMessage.value = ''
  const startedAt = performance.now()
  let worker: Worker

  try {
    worker = new Worker(new URL('../workers/JSONSchemaValidator.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    result.value = null
    unexpectedError.value = 'The isolated validation worker could not be started.'
    liveMessage.value = `Validation failed: ${unexpectedError.value}`
    isValidating.value = false
    return
  }

  activeWorker = worker

  worker.onmessage = (event: MessageEvent<SchemaValidationWorkerResponse>) => {
    if (event.data.requestId !== generation || activeWorker !== worker) return

    lastDuration.value = Math.max(0, Math.round(performance.now() - startedAt))

    if (event.data.ok) {
      result.value = event.data.result
      unexpectedError.value = ''
      liveMessage.value = result.value.valid
        ? 'JSON data is valid against the schema.'
        : `Validation found ${result.value.errorCount} errors and ${result.value.warningCount} warnings.`
    } else {
      result.value = null
      unexpectedError.value = event.data.error
      liveMessage.value = `Validation failed: ${event.data.error}`
    }

    isValidating.value = false
    terminateValidationWorker()
  }

  worker.onerror = () => {
    if (activeWorker !== worker) return

    result.value = null
    unexpectedError.value = 'The isolated validation worker stopped unexpectedly.'
    liveMessage.value = `Validation failed: ${unexpectedError.value}`
    isValidating.value = false
    terminateValidationWorker()
  }

  workerTimeout = window.setTimeout(() => {
    if (activeWorker !== worker) return

    result.value = null
    unexpectedError.value = `Validation exceeded ${VALIDATION_TIMEOUT_MS / 1000} seconds and was stopped. Check schema patterns or reduce the input size.`
    liveMessage.value = 'Validation timed out and the isolated worker was stopped.'
    lastDuration.value = VALIDATION_TIMEOUT_MS
    isValidating.value = false
    terminateValidationWorker()
  }, VALIDATION_TIMEOUT_MS)

  const request: SchemaValidationWorkerRequest = {
    requestId: generation,
    options: {
      schemaText: schemaText.value,
      dataText: dataText.value,
      allErrors: allErrors.value,
      strictDiagnostics: strictDiagnostics.value,
    },
  }

  worker.postMessage(request)
}

function scheduleValidation(): void {
  validationGeneration++
  terminateValidationWorker()
  isValidating.value = false
  if (debounceTimeout !== undefined) window.clearTimeout(debounceTimeout)
  debounceTimeout = window.setTimeout(runValidation, AUTO_VALIDATE_DELAY_MS)
}

function loadExample(validData: boolean): void {
  schemaText.value = JSON.stringify(EXAMPLE_SCHEMA, null, 2)
  dataText.value = JSON.stringify(validData ? VALID_DATA : INVALID_DATA, null, 2)
  diagnosticFilter.value = 'all'
}

function loadInvalidData(): void {
  dataText.value = JSON.stringify(INVALID_DATA, null, 2)
  diagnosticFilter.value = 'all'
}

function formatEditor(source: EditorSource): void {
  const current = source === 'schema' ? schemaText : dataText

  try {
    current.value = JSON.stringify(JSON.parse(current.value), null, 2)
    editorMessage.value = ''
    liveMessage.value = `${source === 'schema' ? 'Schema' : 'Data'} JSON formatted.`
  } catch (error) {
    editorMessage.value = error instanceof Error ? error.message : `Unable to format ${source} JSON.`
  }
}

function copyReport(): void {
  if (!result.value) return
  copyToClipboard(JSON.stringify(result.value, null, 2))
  liveMessage.value = 'Validation report copied to the clipboard.'
}

watch([schemaText, dataText, allErrors, strictDiagnostics], scheduleValidation)
onMounted(runValidation)
onBeforeUnmount(() => {
  validationGeneration++
  if (debounceTimeout !== undefined) window.clearTimeout(debounceTimeout)
  terminateValidationWorker()
})
</script>
