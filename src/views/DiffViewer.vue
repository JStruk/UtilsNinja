<template>
  <div class="mx-auto max-w-7xl space-y-6 pb-8">
    <section aria-labelledby="diff-viewer-heading">
      <div class="mb-6">
        <h2 id="diff-viewer-heading" class="text-2xl font-bold text-slate-900 dark:text-white">
          Text &amp; JSON Diff Viewer
        </h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Compare locally with line-level additions, removals, and unchanged content. Nothing leaves this browser.
        </p>
      </div>

      <form class="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-soft dark:border-slate-800/60 dark:bg-slate-900" @submit.prevent="runDiff">
        <div class="border-b border-slate-200/70 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <fieldset>
              <legend class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Comparison mode</legend>
              <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="group" aria-label="Comparison mode">
                <button
                  v-for="option in modeOptions"
                  :key="option.value"
                  type="button"
                  class="min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  :class="diffMode === option.value
                    ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'"
                  :aria-pressed="diffMode === option.value"
                  @click="diffMode = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Comparison options</legend>
              <div class="flex flex-wrap gap-x-6 gap-y-3">
                <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm font-medium text-slate-600 focus-within:ring-2 focus-within:ring-primary-500 dark:text-slate-300">
                  <input
                    v-model="ignoreWhitespace"
                    type="checkbox"
                    class="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Ignore whitespace
                </label>
                <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm font-medium text-slate-600 focus-within:ring-2 focus-within:ring-primary-500 dark:text-slate-300">
                  <input
                    v-model="ignoreCase"
                    type="checkbox"
                    class="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Ignore letter case
                </label>
              </div>
            </fieldset>
          </div>

          <p class="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <template v-if="diffMode === 'json'">
              JSON is parsed, object keys are sorted recursively, and values are formatted with two-space indentation before comparison. Array order is preserved.
            </template>
            <template v-else>
              Text is compared line by line. CRLF and LF line endings are treated consistently.
            </template>
          </p>
        </div>

        <div class="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-800">
          <div class="border-b border-slate-200 p-6 dark:border-slate-800 lg:border-b-0">
            <div class="mb-3 flex items-end justify-between gap-3">
              <label for="diff-original-input" class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Original input
              </label>
              <span class="text-xs text-slate-400">{{ leftInputStats }}</span>
            </div>
            <textarea
              id="diff-original-input"
              v-model="leftInput"
              rows="12"
              :maxlength="maximumInputCharacters"
              class="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
              :placeholder="inputPlaceholder"
              spellcheck="false"
              aria-describedby="diff-input-limits"
            />
          </div>

          <div class="p-6">
            <div class="mb-3 flex items-end justify-between gap-3">
              <label for="diff-changed-input" class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Changed input
              </label>
              <span class="text-xs text-slate-400">{{ rightInputStats }}</span>
            </div>
            <textarea
              id="diff-changed-input"
              v-model="rightInput"
              rows="12"
              :maxlength="maximumInputCharacters"
              class="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
              :placeholder="inputPlaceholder"
              spellcheck="false"
              aria-describedby="diff-input-limits"
            />
          </div>
        </div>

        <div class="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p id="diff-input-limits" class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Maximum {{ formattedCharacterLimit }} characters and {{ formattedLineLimit }} lines per input. Very large comparison matrices are rejected safely.
            </p>
            <div v-if="errorMessage" class="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
              {{ errorMessage }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2 sm:shrink-0">
            <button
              type="button"
              class="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              @click="swapInputs"
            >
              Swap inputs
            </button>
            <button
              type="button"
              class="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              @click="clearInputs"
            >
              Clear
            </button>
            <button
              type="submit"
              class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
              :disabled="isProcessing"
            >
              <svg v-if="isProcessing" class="h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
                <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
              </svg>
              {{ isProcessing ? 'Comparing…' : 'Compare inputs' }}
            </button>
          </div>
        </div>
      </form>
    </section>

    <section v-if="result" aria-labelledby="diff-results-heading" :aria-busy="isProcessing">
      <div class="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 id="diff-results-heading" class="text-xl font-bold text-slate-900 dark:text-white">Comparison result</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ resultDescription }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="group" aria-label="Diff presentation">
            <button
              v-for="option in presentationOptions"
              :key="option.value"
              type="button"
              class="min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              :class="presentationMode === option.value
                ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'"
              :aria-pressed="presentationMode === option.value"
              @click="presentationMode = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <button
            type="button"
            class="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            @click="copyUnifiedDiff"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy unified diff
          </button>
        </div>
      </div>

      <dl class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <dt class="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Added</dt>
          <dd class="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">+{{ result.summary.added }}</dd>
        </div>
        <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
          <dt class="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">Removed</dt>
          <dd class="mt-1 text-2xl font-bold text-rose-800 dark:text-rose-300">−{{ result.summary.removed }}</dd>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <dt class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Unchanged</dt>
          <dd class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ result.summary.unchanged }}</dd>
        </div>
        <div class="rounded-2xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-900/50 dark:bg-primary-950/30">
          <dt class="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-400">Change blocks</dt>
          <dd class="mt-1 text-2xl font-bold text-primary-800 dark:text-primary-300">{{ result.summary.changeBlocks }}</dd>
        </div>
      </dl>

      <div v-if="!result.summary.hasChanges" class="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300" role="status">
        No differences remain after applying the selected normalization and ignore options.
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div v-if="presentationMode === 'unified'" class="overflow-x-auto" role="table" aria-label="Unified line diff">
          <div class="min-w-[560px]">
            <div class="grid grid-cols-[3.25rem_3.25rem_2rem_minmax(0,1fr)] border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" role="row">
              <span class="px-2 py-3 text-right" role="columnheader" aria-label="Original line">Old</span>
              <span class="px-2 py-3 text-right" role="columnheader" aria-label="Changed line">New</span>
              <span class="px-2 py-3 text-center" role="columnheader" aria-label="Change marker">±</span>
              <span class="px-3 py-3" role="columnheader">Content</span>
            </div>

            <div v-if="result.unifiedRows.length === 0" class="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Both inputs are empty.
            </div>
            <div
              v-for="(row, index) in result.unifiedRows"
              v-else
              :key="`${index}-${row.type}`"
              class="grid grid-cols-[3.25rem_3.25rem_2rem_minmax(0,1fr)] border-b border-slate-100 font-mono text-sm last:border-b-0 dark:border-slate-800"
              :class="unifiedRowClass(row.type)"
              role="row"
              :aria-label="unifiedRowLabel(row)"
            >
              <span class="select-none border-r border-current/10 px-2 py-2 text-right text-xs opacity-60" role="cell">
                {{ displayLineNumber(row.leftLineNumber) }}
              </span>
              <span class="select-none border-r border-current/10 px-2 py-2 text-right text-xs opacity-60" role="cell">
                {{ displayLineNumber(row.rightLineNumber) }}
              </span>
              <span class="select-none px-2 py-2 text-center font-bold" role="cell" aria-hidden="true">
                {{ changeMarker(row.type) }}
              </span>
              <code class="whitespace-pre-wrap break-all px-3 py-2 leading-relaxed" role="cell">{{ unifiedRowText(row) }}</code>
            </div>
          </div>
        </div>

        <div v-else class="overflow-x-auto" role="table" aria-label="Side-by-side line diff">
          <div class="min-w-[760px]">
            <div class="grid grid-cols-2 border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" role="row">
              <span class="border-r border-slate-200 px-4 py-3 dark:border-slate-700" role="columnheader">Original (−)</span>
              <span class="px-4 py-3" role="columnheader">Changed (+)</span>
            </div>

            <div v-if="result.sideBySideRows.length === 0" class="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Both inputs are empty.
            </div>
            <div
              v-for="(row, index) in result.sideBySideRows"
              v-else
              :key="`${index}-${row.type}`"
              class="grid grid-cols-2 border-b border-slate-100 font-mono text-sm last:border-b-0 dark:border-slate-800"
              role="row"
            >
              <div
                class="grid min-w-0 grid-cols-[3.25rem_2rem_minmax(0,1fr)] border-r border-slate-200 dark:border-slate-700"
                :class="sideCellClass(row.left)"
                role="cell"
                :aria-label="sideCellLabel(row.left, 'Original')"
              >
                <span class="select-none border-r border-current/10 px-2 py-2 text-right text-xs opacity-60">
                  {{ displayLineNumber(row.left?.lineNumber ?? null) }}
                </span>
                <span class="select-none px-2 py-2 text-center font-bold" aria-hidden="true">{{ sideCellMarker(row.left) }}</span>
                <code v-if="row.left" class="whitespace-pre-wrap break-all px-3 py-2 leading-relaxed">{{ row.left.text }}</code>
                <span v-else class="px-3 py-2 text-slate-300 dark:text-slate-700" aria-hidden="true">—</span>
              </div>

              <div
                class="grid min-w-0 grid-cols-[3.25rem_2rem_minmax(0,1fr)]"
                :class="sideCellClass(row.right)"
                role="cell"
                :aria-label="sideCellLabel(row.right, 'Changed')"
              >
                <span class="select-none border-r border-current/10 px-2 py-2 text-right text-xs opacity-60">
                  {{ displayLineNumber(row.right?.lineNumber ?? null) }}
                </span>
                <span class="select-none px-2 py-2 text-center font-bold" aria-hidden="true">{{ sideCellMarker(row.right) }}</span>
                <code v-if="row.right" class="whitespace-pre-wrap break-all px-3 py-2 leading-relaxed">{{ row.right.text }}</code>
                <span v-else class="px-3 py-2 text-slate-300 dark:text-slate-700" aria-hidden="true">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  DIFF_LIMITS,
  compareInputs,
  formatUnifiedDiff,
} from '@/utilities/DiffViewer'
import type {
  DiffMode,
  DiffResult,
  DiffRowType,
  SideBySideCell,
  UnifiedDiffRow,
} from '@/utilities/DiffViewer'

type PresentationMode = 'unified' | 'side-by-side'

const leftInput = ref('{\n  "name": "UtilsNinja",\n  "version": 2,\n  "status": "active"\n}')
const rightInput = ref('{\n  "name": "UtilsNinja",\n  "version": 3,\n  "status": "active",\n  "channel": "stable"\n}')
const diffMode = ref<DiffMode>('text')
const presentationMode = ref<PresentationMode>('unified')
const ignoreWhitespace = ref(false)
const ignoreCase = ref(false)
const result = shallowRef<DiffResult | null>(null)
const errorMessage = ref('')
const statusMessage = ref('')
const isProcessing = ref(false)
let comparisonVersion = 0

const modeOptions: ReadonlyArray<{ label: string; value: DiffMode }> = [
  { label: 'Plain text', value: 'text' },
  { label: 'Normalized JSON', value: 'json' },
]

const presentationOptions: ReadonlyArray<{ label: string; value: PresentationMode }> = [
  { label: 'Unified', value: 'unified' },
  { label: 'Side by side', value: 'side-by-side' },
]

const maximumInputCharacters = DIFF_LIMITS.maxCharactersPerInput
const formattedCharacterLimit = DIFF_LIMITS.maxCharactersPerInput.toLocaleString()
const formattedLineLimit = DIFF_LIMITS.maxLinesPerInput.toLocaleString()

const inputPlaceholder = computed(() => diffMode.value === 'json'
  ? '{\n  "name": "UtilsNinja"\n}'
  : 'Paste text here…')

const leftInputStats = computed(() => describeInput(leftInput.value))
const rightInputStats = computed(() => describeInput(rightInput.value))

const resultDescription = computed(() => {
  if (!result.value) return ''
  if (!result.value.summary.hasChanges) return `${result.value.summary.unchanged} comparable lines match.`

  const modified = result.value.summary.modified
    ? ` ${result.value.summary.modified} replacement pairs aligned.`
    : ''
  return `${result.value.summary.added} added, ${result.value.summary.removed} removed, and ${result.value.summary.unchanged} unchanged lines.${modified}`
})

watch(
  [leftInput, rightInput, diffMode, ignoreWhitespace, ignoreCase],
  invalidateResult,
)

function invalidateResult() {
  comparisonVersion += 1
  result.value = null
  errorMessage.value = ''
  statusMessage.value = ''
  isProcessing.value = false
}

async function runDiff() {
  const currentVersion = ++comparisonVersion
  isProcessing.value = true
  errorMessage.value = ''
  statusMessage.value = 'Comparing inputs locally.'

  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 0))

  try {
    const comparison = compareInputs(leftInput.value, rightInput.value, {
      mode: diffMode.value,
      ignoreWhitespace: ignoreWhitespace.value,
      ignoreCase: ignoreCase.value,
    })

    if (currentVersion !== comparisonVersion) return
    result.value = comparison
    statusMessage.value = comparison.summary.hasChanges
      ? `Comparison complete. ${comparison.summary.added} lines added and ${comparison.summary.removed} lines removed.`
      : 'Comparison complete. No differences found.'
  } catch (error: unknown) {
    if (currentVersion !== comparisonVersion) return
    errorMessage.value = error instanceof Error ? error.message : 'Unable to compare these inputs.'
    statusMessage.value = 'Comparison failed.'
  } finally {
    if (currentVersion === comparisonVersion) isProcessing.value = false
  }
}

function swapInputs() {
  const original = leftInput.value
  leftInput.value = rightInput.value
  rightInput.value = original
}

function clearInputs() {
  leftInput.value = ''
  rightInput.value = ''
  invalidateResult()
}

async function copyUnifiedDiff() {
  if (!result.value) return

  try {
    if (!navigator.clipboard) throw new Error('Clipboard access is unavailable in this browser.')
    await navigator.clipboard.writeText(formatUnifiedDiff(result.value))
    statusMessage.value = 'Unified diff copied to the clipboard.'
    toast.success('Unified diff copied to clipboard', { autoClose: 2000 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to copy the diff.'
    errorMessage.value = message
    statusMessage.value = 'Copy failed.'
    toast.error(message, { autoClose: 3000 })
  }
}

function describeInput(input: string): string {
  const lines = input === '' ? 0 : input.split(/\r\n|\n|\r/).length
  return `${input.length.toLocaleString()} chars · ${lines.toLocaleString()} lines`
}

function displayLineNumber(lineNumber: number | null): string {
  return lineNumber === null ? '' : lineNumber.toString()
}

function unifiedRowText(row: UnifiedDiffRow): string {
  return row.type === 'added' ? row.rightText ?? '' : row.leftText ?? ''
}

function changeMarker(type: DiffRowType): string {
  if (type === 'added') return '+'
  if (type === 'removed') return '−'
  return ' '
}

function unifiedRowClass(type: DiffRowType): string {
  if (type === 'added') return 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
  if (type === 'removed') return 'bg-rose-50 text-rose-950 dark:bg-rose-950/30 dark:text-rose-200'
  return 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'
}

function unifiedRowLabel(row: UnifiedDiffRow): string {
  if (row.type === 'added') return `Added line ${row.rightLineNumber}: ${row.rightText ?? ''}`
  if (row.type === 'removed') return `Removed line ${row.leftLineNumber}: ${row.leftText ?? ''}`
  return `Unchanged original line ${row.leftLineNumber}, changed line ${row.rightLineNumber}: ${row.leftText ?? ''}`
}

function sideCellClass(cell: SideBySideCell | null): string {
  if (!cell) return 'bg-slate-50/50 text-slate-300 dark:bg-slate-950/20 dark:text-slate-700'
  if (cell.type === 'added') return 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
  if (cell.type === 'removed') return 'bg-rose-50 text-rose-950 dark:bg-rose-950/30 dark:text-rose-200'
  return 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'
}

function sideCellMarker(cell: SideBySideCell | null): string {
  return cell ? changeMarker(cell.type) : ''
}

function sideCellLabel(cell: SideBySideCell | null, column: string): string {
  if (!cell) return `${column}: no corresponding line.`
  const action = cell.type === 'added' ? 'added' : cell.type === 'removed' ? 'removed' : 'unchanged'
  return `${column} line ${cell.lineNumber}, ${action}: ${cell.text}`
}
</script>
