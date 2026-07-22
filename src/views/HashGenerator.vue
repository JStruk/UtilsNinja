<template>
  <TwoPaneLayout>
    <template #left-pane>
      <div class="flex h-full min-h-0 flex-col">
        <div class="border-b bg-white px-6 py-4 dark:bg-slate-900">
          <h2 class="font-semibold text-slate-800 dark:text-slate-100">Hash settings</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Data stays in this browser and is processed with Web Crypto.
          </p>
        </div>

        <form class="flex-1 space-y-6 overflow-auto p-6 custom-scrollbar" @submit.prevent="generate">
          <fieldset>
            <legend class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Input source
            </legend>
            <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Input source">
              <button
                v-for="option in inputModeOptions"
                :key="option.value"
                type="button"
                class="min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                :class="inputMode === option.value
                  ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'"
                :aria-pressed="inputMode === option.value"
                @click="inputMode = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </fieldset>

          <div v-if="inputMode === 'text'" class="space-y-2">
            <label for="hash-text-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Text to process
            </label>
            <textarea
              id="hash-text-input"
              v-model="textInput"
              rows="8"
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-describedby="hash-text-help"
              placeholder="Enter text, including an empty string..."
            />
            <p id="hash-text-help" class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Text is encoded as UTF-8 before hashing. An empty string is a valid input.
            </p>
          </div>

          <div v-else class="space-y-3">
            <label for="hash-file-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Local file
            </label>
            <input
              id="hash-file-input"
              ref="fileInputElement"
              type="file"
              class="block min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:min-h-11 file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:font-semibold file:text-primary-700 hover:file:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:file:bg-primary-900/30 dark:file:text-primary-300"
              aria-describedby="hash-file-help"
              @change="onFileSelected"
            />
            <p id="hash-file-help" class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Files up to {{ formattedMaximumFileSize }} are loaded into memory locally and are never uploaded.
            </p>
            <div
              v-if="selectedFile"
              class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ selectedFile.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button
                type="button"
                class="min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                @click="clearSelectedFile"
              >
                Remove
              </button>
            </div>
          </div>

          <fieldset>
            <legend class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Operation
            </legend>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in operationOptions"
                :key="option.value"
                type="button"
                class="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                :class="operation === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'"
                :aria-pressed="operation === option.value"
                @click="operation = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </fieldset>

          <div v-if="operation === 'hmac'" class="space-y-2">
            <label for="hmac-secret" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
              HMAC secret key
            </label>
            <div class="flex gap-2">
              <input
                id="hmac-secret"
                v-model="hmacSecret"
                :type="showSecret ? 'text' : 'password'"
                class="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 font-mono text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                autocomplete="off"
                aria-describedby="hmac-secret-help"
              />
              <button
                type="button"
                class="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                :aria-pressed="showSecret"
                @click="showSecret = !showSecret"
              >
                {{ showSecret ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p id="hmac-secret-help" class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The secret is UTF-8 encoded and remains only in this page's memory.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label for="hash-algorithm" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Algorithm
              </label>
              <select
                id="hash-algorithm"
                v-model="algorithm"
                class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option v-for="option in HASH_ALGORITHMS" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label for="hash-output-encoding" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Output format
              </label>
              <select
                id="hash-output-encoding"
                v-model="outputEncoding"
                class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
              </select>
            </div>
          </div>

          <div v-if="visibleErrorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
            {{ visibleErrorMessage }}
          </div>

          <button
            type="submit"
            class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
            :disabled="!canGenerate || isProcessing"
          >
            <svg v-if="isProcessing" class="h-5 w-5 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
              <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
            </svg>
            {{ isProcessing ? 'Processing locally…' : generateButtonLabel }}
          </button>
        </form>
      </div>
    </template>

    <template #right-pane>
      <div class="flex h-full min-h-0 flex-col" :aria-busy="isProcessing">
        <div class="flex items-center justify-between gap-4 border-b bg-white px-6 py-4 dark:bg-slate-900">
          <div>
            <h2 class="font-semibold text-slate-800 dark:text-slate-100">{{ resultTitle }}</h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ resultSummary }}</p>
          </div>
          <button
            v-if="result"
            type="button"
            class="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            @click="copyResult"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy
          </button>
        </div>

        <div class="flex-1 overflow-auto bg-slate-50/30 p-6 custom-scrollbar dark:bg-slate-900/10">
          <div v-if="result" class="space-y-4">
            <label for="hash-result" class="sr-only">Generated {{ resultTitle }}</label>
            <textarea
              id="hash-result"
              :value="result"
              readonly
              rows="8"
              class="w-full resize-none break-all rounded-2xl border border-slate-200 bg-white p-5 font-mono text-sm leading-relaxed text-primary-700 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-primary-300"
            />
            <dl class="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Algorithm</dt>
                <dd class="mt-1 font-medium text-slate-700 dark:text-slate-200">{{ algorithm }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Encoding</dt>
                <dd class="mt-1 font-medium capitalize text-slate-700 dark:text-slate-200">{{ outputEncoding }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Input</dt>
                <dd class="mt-1 break-words font-medium text-slate-700 dark:text-slate-200">{{ inputSummary }}</dd>
              </div>
            </dl>
          </div>

          <div v-else class="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-900/30 dark:text-primary-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 9h16" />
                <path d="M4 15h16" />
                <path d="M10 3 8 21" />
                <path d="m16 3-2 18" />
              </svg>
            </div>
            <p class="font-semibold text-slate-700 dark:text-slate-200">No output yet</p>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Choose the algorithm and input, then generate a deterministic hash or keyed HMAC.
            </p>
          </div>
        </div>

        <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import {
  HASH_ALGORITHMS,
  generateFileHash,
  generateFileHmac,
  generateHash,
  generateHmac,
} from '@/utilities/HashGenerator'
import type { HashAlgorithm, HashOutputEncoding } from '@/utilities/HashGenerator'

type InputMode = 'text' | 'file'
type Operation = 'hash' | 'hmac'

const MAXIMUM_FILE_SIZE = 100 * 1024 * 1024

const inputMode = ref<InputMode>('text')
const operation = ref<Operation>('hash')
const algorithm = ref<HashAlgorithm>('SHA-256')
const outputEncoding = ref<HashOutputEncoding>('hex')
const textInput = ref('UtilsNinja')
const hmacSecret = ref('')
const showSecret = ref(false)
const selectedFile = shallowRef<File | null>(null)
const fileInputElement = ref<HTMLInputElement | null>(null)
const result = ref('')
const errorMessage = ref('')
const statusMessage = ref('')
const isProcessing = ref(false)
let generationVersion = 0

const inputModeOptions: ReadonlyArray<{ label: string; value: InputMode }> = [
  { label: 'Text', value: 'text' },
  { label: 'Local file', value: 'file' },
]

const operationOptions: ReadonlyArray<{ label: string; value: Operation }> = [
  { label: 'Hash / checksum', value: 'hash' },
  { label: 'HMAC', value: 'hmac' },
]

const formattedMaximumFileSize = formatFileSize(MAXIMUM_FILE_SIZE)

const canGenerate = computed(() => {
  const hasInput = inputMode.value === 'text'
    || (selectedFile.value !== null && selectedFile.value.size <= MAXIMUM_FILE_SIZE)
  const hasSecret = operation.value === 'hash' || hmacSecret.value.length > 0

  return hasInput && hasSecret
})

const fileSizeError = computed(() => {
  if (!selectedFile.value || selectedFile.value.size <= MAXIMUM_FILE_SIZE) return ''
  return `Choose a file smaller than ${formattedMaximumFileSize}. Web Crypto must load the entire file into memory.`
})

const visibleErrorMessage = computed(() => fileSizeError.value || errorMessage.value)

const resultTitle = computed(() => operation.value === 'hmac' ? 'HMAC output' : 'Hash output')

const resultSummary = computed(() => {
  const source = inputMode.value === 'file' ? 'file' : 'UTF-8 text'
  return `${algorithm.value} · ${outputEncoding.value.toUpperCase()} · ${source}`
})

const inputSummary = computed(() => {
  if (inputMode.value === 'file' && selectedFile.value) {
    return `${selectedFile.value.name} (${formatFileSize(selectedFile.value.size)})`
  }

  const byteCount = new TextEncoder().encode(textInput.value).byteLength
  return `UTF-8 text (${formatByteCount(byteCount)})`
})

const generateButtonLabel = computed(() => {
  if (operation.value === 'hmac') return 'Generate HMAC'
  return inputMode.value === 'file' ? 'Generate checksum' : 'Generate hash'
})

watch(
  [inputMode, operation, algorithm, outputEncoding, textInput, hmacSecret],
  invalidateResult,
)

function invalidateResult() {
  generationVersion += 1
  result.value = ''
  errorMessage.value = ''
  statusMessage.value = ''
  isProcessing.value = false
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  invalidateResult()
}

function clearSelectedFile() {
  selectedFile.value = null
  if (fileInputElement.value) fileInputElement.value.value = ''
  invalidateResult()
}

async function generate() {
  if (!canGenerate.value) {
    errorMessage.value = operation.value === 'hmac' && !hmacSecret.value
      ? 'Enter an HMAC secret key.'
      : 'Choose a local file to process.'
    return
  }

  const currentVersion = ++generationVersion
  isProcessing.value = true
  errorMessage.value = ''
  statusMessage.value = 'Processing input locally.'

  try {
    let output: string

    if (inputMode.value === 'file') {
      const file = selectedFile.value as File
      output = operation.value === 'hmac'
        ? await generateFileHmac(file, hmacSecret.value, algorithm.value, outputEncoding.value)
        : await generateFileHash(file, algorithm.value, outputEncoding.value)
    } else {
      output = operation.value === 'hmac'
        ? await generateHmac(textInput.value, hmacSecret.value, algorithm.value, outputEncoding.value)
        : await generateHash(textInput.value, algorithm.value, outputEncoding.value)
    }

    if (currentVersion !== generationVersion) return

    result.value = output
    statusMessage.value = `${resultTitle.value} generated successfully.`
  } catch (error: unknown) {
    if (currentVersion !== generationVersion) return

    errorMessage.value = error instanceof Error ? error.message : 'Unable to process this input.'
    statusMessage.value = 'Generation failed.'
  } finally {
    if (currentVersion === generationVersion) isProcessing.value = false
  }
}

async function copyResult() {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard access is unavailable in this browser.')
    await navigator.clipboard.writeText(result.value)
    statusMessage.value = `${resultTitle.value} copied to the clipboard.`
    toast.success('Output copied to clipboard', { autoClose: 2000 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to copy the output.'
    errorMessage.value = message
    statusMessage.value = 'Copy failed.'
    toast.error(message, { autoClose: 3000 })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

function formatByteCount(bytes: number): string {
  return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`
}
</script>
