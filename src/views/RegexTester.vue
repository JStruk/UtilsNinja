<template>
  <div class="h-full min-h-0">
    <TwoPaneLayout>
      <template #left-pane>
        <section class="flex h-full min-h-0 flex-col" aria-labelledby="regex-editor-heading">
          <header class="border-b border-slate-100 bg-slate-950 p-5 dark:border-slate-800">
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <div class="mb-1 flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.8)]" aria-hidden="true"></span>
                  <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-lime-300">Pattern lab</p>
                </div>
                <h2 id="regex-editor-heading" class="text-lg font-bold text-white">Regex Tester & Replacer</h2>
                <p class="mt-1 text-sm text-slate-400">JavaScript syntax · isolated execution · bounded results</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-lime-500 hover:text-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
                @click="loadExample"
              >
                Load example
              </button>
            </div>

            <label for="regex-pattern" class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Pattern</label>
            <div class="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 font-mono shadow-inner focus-within:border-lime-400 focus-within:ring-4 focus-within:ring-lime-400/10">
              <span class="select-none text-xl text-lime-400" aria-hidden="true">/</span>
              <input
                id="regex-pattern"
                v-model="pattern"
                type="text"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                :maxlength="DEFAULT_REGEX_LIMITS.maxPatternLength"
                class="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 font-mono text-base text-white outline-none placeholder:text-slate-600"
                placeholder="(?&lt;name&gt;[a-z]+)"
                :aria-describedby="analysisError ? 'regex-engine-error' : 'pattern-help'"
              >
              <span class="select-none text-xl text-lime-400" aria-hidden="true">/</span>
              <span class="ml-1 min-w-6 text-sm font-bold text-amber-300" aria-label="Selected flags">{{ flags || '—' }}</span>
            </div>
            <div class="mt-2 flex justify-between gap-4 text-[11px] text-slate-500">
              <p id="pattern-help">Enter the expression without wrapping slashes.</p>
              <p>{{ pattern.length.toLocaleString() }} / {{ DEFAULT_REGEX_LIMITS.maxPatternLength.toLocaleString() }}</p>
            </div>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto p-5">
            <fieldset>
              <legend class="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Flags</legend>
              <div class="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
                <label
                  v-for="option in flagOptions"
                  :key="option.value"
                  class="group relative cursor-pointer rounded-lg border px-2 py-2 text-center font-mono text-sm font-bold transition focus-within:ring-2 focus-within:ring-primary-500"
                  :class="[
                    selectedFlags.includes(option.value)
                      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-300'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white',
                    !option.supported ? 'cursor-not-allowed opacity-40' : '',
                  ]"
                  :title="option.supported ? option.description : `${option.description} Not supported by this browser.`"
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    :checked="selectedFlags.includes(option.value)"
                    :disabled="!option.supported"
                    :aria-label="`${option.value}: ${option.description}`"
                    @change="toggleFlag(option.value)"
                  >
                  {{ option.value }}
                </label>
              </div>
              <p class="mt-2 text-xs text-slate-400">{{ selectedFlagHelp }}</p>
            </fieldset>

            <div>
              <label for="regex-replacement" class="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Replacement</label>
              <input
                id="regex-replacement"
                v-model="replacement"
                type="text"
                autocomplete="off"
                spellcheck="false"
                :maxlength="DEFAULT_REGEX_LIMITS.maxReplacementLength"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="$2, $1 or $&"
              >
              <p class="mt-2 text-xs text-slate-400">Supports JavaScript tokens such as <code>$&</code>, <code>$1</code>, <code>$&lt;name&gt;</code>, and <code>$$</code>.</p>
            </div>

            <div class="flex min-h-[260px] flex-1 flex-col">
              <div class="mb-2 flex items-center justify-between gap-3">
                <label for="regex-input" class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Test string</label>
                <span class="text-[11px] text-slate-400">{{ testInput.length.toLocaleString() }} / {{ VIEW_LIMITS.maxInputLength?.toLocaleString() }}</span>
              </div>
              <textarea
                id="regex-input"
                v-model="testInput"
                spellcheck="false"
                :maxlength="VIEW_LIMITS.maxInputLength"
                class="min-h-[240px] flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
                placeholder="Paste the text you want to test…"
              ></textarea>
            </div>

            <div class="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
              <strong class="font-bold">Safety boundary:</strong> each run uses a disposable Web Worker and is stopped after {{ WORKER_TIMEOUT_MS }} ms. Results are capped at {{ VIEW_LIMITS.maxMatches }} matches.
            </div>
          </div>

          <footer class="flex items-center justify-between gap-4 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p class="min-w-0 truncate font-mono text-xs text-slate-400" :title="expressionPreview">/{{ expressionPreview }}/{{ flags }}</p>
            <button
              type="button"
              class="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:cursor-wait disabled:opacity-70"
              :disabled="isRunning"
              @click="runAnalysis"
            >
              <span v-if="isRunning" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true"></span>
              {{ isRunning ? 'Testing…' : 'Run test' }}
            </button>
          </footer>
        </section>
      </template>

      <template #right-pane>
        <section class="flex h-full min-h-0 flex-col" aria-labelledby="regex-results-heading" :aria-busy="isRunning">
          <header class="border-b border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Result stream</p>
                <h2 id="regex-results-heading" class="text-lg font-bold text-slate-900 dark:text-white">Matches & replacement</h2>
              </div>
              <div class="flex items-center gap-2">
                <span class="rounded-full px-3 py-1.5 text-xs font-bold" :class="resultStatusClasses">{{ resultStatus }}</span>
                <span v-if="lastDuration !== null" class="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ lastDuration }} ms</span>
              </div>
            </div>

            <p v-if="analysisError" id="regex-engine-error" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
              {{ analysisError }}
            </p>

            <ul v-if="analysis?.warnings.length" class="mt-4 space-y-1 text-xs text-amber-700 dark:text-amber-300" aria-label="Result warnings">
              <li v-for="warning in analysis.warnings" :key="warning" class="flex gap-2">
                <span aria-hidden="true">△</span><span>{{ warning }}</span>
              </li>
            </ul>
          </header>

          <div class="flex gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800" aria-label="Result view">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="activePanel === 'highlight' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'"
              :aria-pressed="activePanel === 'highlight'"
              @click="activePanel = 'highlight'"
            >
              Highlights & preview
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="activePanel === 'matches' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'"
              :aria-pressed="activePanel === 'matches'"
              @click="activePanel = 'matches'"
            >
              All matches <span v-if="analysis" class="ml-1 opacity-60">{{ analysis.matches.length }}</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5">
            <div v-if="isRunning && !analysis" class="flex h-full min-h-64 items-center justify-center" aria-live="polite">
              <div class="text-center">
                <span class="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" aria-hidden="true"></span>
                <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Evaluating in a safe worker…</p>
              </div>
            </div>

            <div v-else-if="!analysis" class="flex h-full min-h-64 items-center justify-center">
              <div class="max-w-sm text-center">
                <p class="mb-2 text-3xl" aria-hidden="true">/…/</p>
                <p class="font-bold text-slate-700 dark:text-slate-200">No result yet</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Edit the expression or choose Run test.</p>
              </div>
            </div>

            <template v-else-if="activePanel === 'highlight'">
              <section aria-labelledby="highlight-heading">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 id="highlight-heading" class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Highlighted input</h3>
                  <button type="button" class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline" @click="copyValue(testInput, 'Test input')">Copy input</button>
                </div>
                <div class="min-h-40 rounded-2xl border border-slate-200 bg-white p-4 shadow-inner dark:border-slate-700 dark:bg-slate-950">
                  <div v-if="testInput" class="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-slate-700 dark:text-slate-300" aria-label="Test input with regex matches highlighted">
                    <template v-for="(segment, index) in analysis.segments" :key="`${segment.start}-${segment.end}-${index}`">
                      <span v-if="segment.kind === 'text'">{{ segment.text }}</span>
                      <span
                        v-else-if="segment.zeroLength"
                        class="relative inline-block h-5 w-0 border-l-2 border-fuchsia-500 align-middle"
                        :title="`Zero-length match ${segment.matchNumber} at index ${segment.start}`"
                        :aria-label="`Zero-length match ${segment.matchNumber} at index ${segment.start}`"
                      ></span>
                      <mark
                        v-else
                        class="rounded px-0.5 py-0.5 text-inherit ring-1 ring-inset"
                        :class="matchTone(segment.matchNumber ?? 0)"
                        :title="`Match ${segment.matchNumber}: indices ${segment.start}–${segment.end}`"
                      >{{ segment.text }}</mark>
                    </template>
                  </div>
                  <p v-else class="text-sm italic text-slate-400">The test string is empty.</p>
                </div>
              </section>

              <section class="mt-6" aria-labelledby="replacement-heading">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 id="replacement-heading" class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Replacement preview</h3>
                  <button
                    type="button"
                    :disabled="analysis.replacementPreview === null"
                    class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-40"
                    @click="copyValue(analysis.replacementPreview ?? '', 'Replacement preview')"
                  >
                    Copy result
                  </button>
                </div>
                <pre v-if="analysis.replacementPreview !== null" class="min-h-32 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">{{ analysis.replacementPreview }}</pre>
                <div v-else class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                  Preview unavailable because the bounded match result was truncated.
                </div>
              </section>
            </template>

            <section v-else aria-labelledby="matches-heading">
              <div class="mb-3 flex items-center justify-between gap-3">
                <h3 id="matches-heading" class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">All bounded matches</h3>
                <p class="text-xs text-slate-400">Indices use <code>[start, end)</code></p>
              </div>

              <div v-if="analysis.matches.length" class="space-y-3">
                <details
                  v-for="match in analysis.matches"
                  :key="match.number"
                  class="group overflow-hidden rounded-xl border border-slate-200 bg-white open:border-primary-300 dark:border-slate-700 dark:bg-slate-900 dark:open:border-primary-700"
                  :open="analysis.matches.length <= 3"
                >
                  <summary class="cursor-pointer list-none p-4 outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                    <span class="flex min-w-0 items-center gap-3">
                      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-bold text-white dark:bg-primary-600">{{ match.number }}</span>
                      <code class="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{{ displayValue(match.value) }}</code>
                      <span class="shrink-0 font-mono text-xs text-slate-400">[{{ match.start }}, {{ match.end }})</span>
                    </span>
                  </summary>

                  <div class="space-y-4 border-t border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                    <div>
                      <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Full match</p>
                      <pre class="whitespace-pre-wrap break-all rounded-lg bg-white p-3 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{{ match.value || '∅ zero-length match' }}</pre>
                    </div>

                    <div v-if="match.captures.length">
                      <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Capture groups</p>
                      <div class="space-y-1.5">
                        <div v-for="capture in match.captures" :key="capture.group" class="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-800">
                          <code class="font-bold text-primary-600 dark:text-primary-400">${{ capture.group }}</code>
                          <code class="text-slate-400">{{ captureRange(capture.start, capture.end) }}</code>
                          <code class="truncate text-right text-slate-700 dark:text-slate-200">{{ displayCapture(capture.value) }}</code>
                        </div>
                      </div>
                    </div>

                    <div v-if="match.namedCaptures.length">
                      <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Named groups</p>
                      <div class="space-y-1.5">
                        <div v-for="capture in match.namedCaptures" :key="capture.name" class="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-800">
                          <code class="font-bold text-fuchsia-600 dark:text-fuchsia-400">{{ capture.name }}</code>
                          <code class="text-slate-400">{{ captureRange(capture.start, capture.end) }}</code>
                          <code class="truncate text-right text-slate-700 dark:text-slate-200">{{ displayCapture(capture.value) }}</code>
                        </div>
                      </div>
                    </div>

                    <p v-if="!match.captures.length" class="text-xs italic text-slate-400">This match has no capture groups.</p>
                  </div>
                </details>
              </div>

              <div v-else class="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center dark:border-slate-700">
                <p class="font-bold text-slate-700 dark:text-slate-200">No matches</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">The expression is valid but did not match the test string.</p>
              </div>
            </section>
          </div>

          <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
        </section>
      </template>
    </TwoPaneLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import {
  DEFAULT_REGEX_LIMITS,
  type RegexAnalysisResult,
  type RegexLimits,
  type RegexWorkerRequest,
  type RegexWorkerResponse,
} from '@/utilities/RegexTester'

type ResultPanel = 'highlight' | 'matches'

interface FlagOption {
  value: string
  description: string
  supported: boolean
}

const WORKER_TIMEOUT_MS = 750
const AUTO_RUN_DELAY_MS = 300
const VIEW_LIMITS: Partial<RegexLimits> = {
  maxInputLength: 50_000,
  maxMatches: 250,
  maxOutputLength: 100_000,
}
const EXAMPLE = {
  pattern: '(?<protocol>https?):\\/\\/(?<host>[^/\\s]+)',
  flags: ['g', 'i'],
  replacement: '$<protocol>://redacted.local',
  input: 'Production: https://api.example.com/v1/users\nLocal: http://localhost:5173/debug',
}

function supportsFlag(flag: string): boolean {
  try {
    new RegExp('', flag)
    return true
  } catch {
    return false
  }
}

const flagOptions: FlagOption[] = [
  { value: 'd', description: 'Expose match indices', supported: supportsFlag('d') },
  { value: 'g', description: 'Find every match', supported: true },
  { value: 'i', description: 'Ignore letter case', supported: true },
  { value: 'm', description: 'Multiline anchors', supported: true },
  { value: 's', description: 'Dot matches newlines', supported: true },
  { value: 'u', description: 'Unicode mode', supported: true },
  { value: 'v', description: 'Unicode sets mode', supported: supportsFlag('v') },
  { value: 'y', description: 'Sticky matching', supported: true },
]

const pattern = ref(EXAMPLE.pattern)
const selectedFlags = ref<string[]>([...EXAMPLE.flags])
const replacement = ref(EXAMPLE.replacement)
const testInput = ref(EXAMPLE.input)
const analysis = ref<RegexAnalysisResult | null>(null)
const analysisError = ref('')
const isRunning = ref(false)
const lastDuration = ref<number | null>(null)
const liveMessage = ref('')
const activePanel = ref<ResultPanel>('highlight')

let activeWorker: Worker | null = null
let workerTimeout: number | undefined
let debounceTimeout: number | undefined
let nextRequestId = 0

const flags = computed(() => flagOptions
  .filter(option => selectedFlags.value.includes(option.value))
  .map(option => option.value)
  .join(''))
const expressionPreview = computed(() => pattern.value || '(?:)')
const selectedFlagHelp = computed(() => {
  const descriptions = flagOptions
    .filter(option => selectedFlags.value.includes(option.value))
    .map(option => `${option.value}: ${option.description.toLowerCase()}`)

  return descriptions.length ? descriptions.join(' · ') : 'No flags selected; only the first match is returned.'
})
const resultStatus = computed(() => {
  if (isRunning.value) return 'Running safely'
  if (analysisError.value) return 'Expression error'
  if (!analysis.value) return 'Waiting'
  return `${analysis.value.matches.length}${analysis.value.matchesTruncated ? '+' : ''} ${analysis.value.matches.length === 1 ? 'match' : 'matches'}`
})
const resultStatusClasses = computed(() => {
  if (isRunning.value) return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
  if (analysisError.value) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
  if (analysis.value?.matches.length) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
})

function terminateWorker(): void {
  activeWorker?.terminate()
  activeWorker = null

  if (workerTimeout !== undefined) {
    window.clearTimeout(workerTimeout)
    workerTimeout = undefined
  }
}

function runAnalysis(): void {
  if (debounceTimeout !== undefined) {
    window.clearTimeout(debounceTimeout)
    debounceTimeout = undefined
  }

  terminateWorker()

  if (typeof Worker === 'undefined') {
    analysis.value = null
    analysisError.value = 'Web Workers are unavailable, so this expression cannot be evaluated safely in this browser.'
    isRunning.value = false
    return
  }

  const requestId = ++nextRequestId
  const startedAt = performance.now()
  let worker: Worker

  try {
    worker = new Worker(new URL('../workers/RegexTester.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    analysis.value = null
    analysisError.value = 'The isolated regex worker could not be started.'
    isRunning.value = false
    return
  }

  activeWorker = worker
  isRunning.value = true
  analysisError.value = ''

  worker.onmessage = (event: MessageEvent<RegexWorkerResponse>) => {
    if (event.data.requestId !== requestId || activeWorker !== worker) return

    lastDuration.value = Math.max(0, Math.round(performance.now() - startedAt))

    if (event.data.ok) {
      analysis.value = event.data.result
      analysisError.value = ''
      liveMessage.value = `${event.data.result.matches.length} matches found.`
    } else {
      analysis.value = null
      analysisError.value = event.data.error.message
      liveMessage.value = `Regular expression error: ${event.data.error.message}`
    }

    isRunning.value = false
    terminateWorker()
  }

  worker.onerror = () => {
    if (activeWorker !== worker) return

    analysis.value = null
    analysisError.value = 'The regex worker stopped unexpectedly. Check the pattern and try again.'
    isRunning.value = false
    terminateWorker()
  }

  workerTimeout = window.setTimeout(() => {
    if (activeWorker !== worker) return

    analysis.value = null
    analysisError.value = `This expression exceeded ${WORKER_TIMEOUT_MS} ms and was stopped. Simplify nested repetitions or test a smaller input.`
    liveMessage.value = 'Regular expression evaluation timed out and was stopped.'
    lastDuration.value = WORKER_TIMEOUT_MS
    isRunning.value = false
    terminateWorker()
  }, WORKER_TIMEOUT_MS)

  const request: RegexWorkerRequest = {
    requestId,
    options: {
      pattern: pattern.value,
      flags: flags.value,
      input: testInput.value,
      replacement: replacement.value,
      limits: VIEW_LIMITS,
    },
  }

  worker.postMessage(request)
}

function scheduleAnalysis(): void {
  if (debounceTimeout !== undefined) window.clearTimeout(debounceTimeout)
  debounceTimeout = window.setTimeout(runAnalysis, AUTO_RUN_DELAY_MS)
}

function toggleFlag(flag: string): void {
  const nextFlags = new Set(selectedFlags.value)

  if (nextFlags.has(flag)) {
    nextFlags.delete(flag)
  } else {
    nextFlags.add(flag)
    if (flag === 'u') nextFlags.delete('v')
    if (flag === 'v') nextFlags.delete('u')
  }

  selectedFlags.value = flagOptions
    .map(option => option.value)
    .filter(option => nextFlags.has(option))
}

function loadExample(): void {
  pattern.value = EXAMPLE.pattern
  selectedFlags.value = [...EXAMPLE.flags]
  replacement.value = EXAMPLE.replacement
  testInput.value = EXAMPLE.input
  activePanel.value = 'highlight'
}

function matchTone(matchNumber: number): string {
  const tones = [
    'bg-lime-200/80 ring-lime-400 dark:bg-lime-500/25 dark:ring-lime-500',
    'bg-sky-200/80 ring-sky-400 dark:bg-sky-500/25 dark:ring-sky-500',
    'bg-amber-200/80 ring-amber-400 dark:bg-amber-500/25 dark:ring-amber-500',
    'bg-fuchsia-200/80 ring-fuchsia-400 dark:bg-fuchsia-500/25 dark:ring-fuchsia-500',
  ]

  return tones[(matchNumber - 1) % tones.length] ?? tones[0] ?? ''
}

function displayValue(value: string): string {
  if (!value) return '∅ zero-length match'
  return value.replace(/\n/g, '↵ ').replace(/\t/g, '⇥ ')
}

function displayCapture(value: string | null): string {
  if (value === null) return 'unmatched'
  if (value === '') return '∅ empty'
  return displayValue(value)
}

function captureRange(start: number | null, end: number | null): string {
  return start === null || end === null ? '[—)' : `[${start}, ${end})`
}

async function copyValue(value: string, label: string): Promise<void> {
  if (!value) return
  const result = await copyToClipboard(value)
  if (result.success) {
    liveMessage.value = `${label} copied to the clipboard.`
    toast.success(`${label} copied to clipboard`, { autoClose: 2000 })
  } else {
    liveMessage.value = `Copy failed: ${result.error}`
    toast.error(result.error, { autoClose: 3000 })
  }
}

watch([pattern, flags, replacement, testInput], scheduleAnalysis)
onMounted(runAnalysis)
onBeforeUnmount(() => {
  if (debounceTimeout !== undefined) window.clearTimeout(debounceTimeout)
  terminateWorker()
})
</script>
