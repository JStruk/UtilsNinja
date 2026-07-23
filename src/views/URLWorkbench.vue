<template>
  <div class="h-full min-h-0">
    <TwoPaneLayout>
      <template #left-pane>
        <section class="flex h-full min-h-0 flex-col" aria-labelledby="url-anatomy-heading">
          <header class="border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <div class="mb-1 flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" aria-hidden="true"></span>
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">URL anatomy</p>
                </div>
                <h2 id="url-anatomy-heading" class="text-lg font-bold text-slate-900 dark:text-white">Inspect and rebuild</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Parse a URL, then edit every part without losing duplicate query keys.</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                @click="loadExample"
              >
                Load example
              </button>
            </div>

            <form class="space-y-2" @submit.prevent="parseSourceURL">
              <label for="source-url" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">URL to parse</label>
              <div class="flex flex-col gap-2 sm:flex-row">
                <input
                  id="source-url"
                  v-model="sourceURL"
                  type="url"
                  inputmode="url"
                  autocomplete="url"
                  spellcheck="false"
                  class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="https://api.example.com/v1/users?limit=20"
                  :aria-describedby="parseError ? 'source-url-help source-url-error' : 'source-url-help'"
                >
                <button
                  type="submit"
                  class="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 dark:bg-primary-600 dark:hover:bg-primary-500"
                >
                  Parse URL
                </button>
              </div>
              <p id="source-url-help" class="text-xs text-slate-400">Include a protocol such as <span class="font-mono">https://</span>.</p>
              <p v-if="parseError" id="source-url-error" class="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">{{ parseError }}</p>
            </form>
          </header>

          <div class="flex-1 space-y-6 overflow-y-auto p-5">
            <fieldset>
              <legend class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Address</legend>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div class="sm:col-span-3">
                  <label for="url-protocol" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Protocol</label>
                  <div class="relative">
                    <input
                      id="url-protocol"
                      v-model="editableParts.protocol"
                      list="url-protocol-options"
                      spellcheck="false"
                      class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 font-mono text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                    <span class="pointer-events-none absolute right-3 top-2.5 font-mono text-sm text-slate-400">:</span>
                  </div>
                  <datalist id="url-protocol-options">
                    <option value="https"></option>
                    <option value="http"></option>
                    <option value="wss"></option>
                    <option value="ws"></option>
                    <option value="ftp"></option>
                  </datalist>
                </div>
                <div class="sm:col-span-6">
                  <label for="url-hostname" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Hostname</label>
                  <input
                    id="url-hostname"
                    v-model="editableParts.hostname"
                    spellcheck="false"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="api.example.com"
                  >
                </div>
                <div class="sm:col-span-3">
                  <label for="url-port" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Port</label>
                  <input
                    id="url-port"
                    v-model="editableParts.port"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="443"
                  >
                </div>
                <div class="sm:col-span-8">
                  <label for="url-pathname" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Path</label>
                  <input
                    id="url-pathname"
                    v-model="editableParts.pathname"
                    spellcheck="false"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="/v1/users"
                  >
                </div>
                <div class="sm:col-span-4">
                  <label for="url-hash" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Fragment</label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-3 top-2.5 font-mono text-sm text-slate-400">#</span>
                    <input
                      id="url-hash"
                      v-model="editableParts.hash"
                      spellcheck="false"
                      class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-7 pr-3 font-mono text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="response"
                    >
                  </div>
                </div>
              </div>
            </fieldset>

            <details class="group rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
              <summary class="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:text-slate-200">
                <span class="flex items-center justify-between">
                  Credentials <span class="text-xs font-normal text-slate-400">Optional</span>
                </span>
              </summary>
              <div class="grid grid-cols-1 gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-700">
                <div>
                  <label for="url-username" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                  <input id="url-username" v-model="editableParts.username" autocomplete="off" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                </div>
                <div>
                  <label for="url-password" class="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                  <input id="url-password" v-model="editableParts.password" type="password" autocomplete="new-password" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                </div>
              </div>
            </details>

            <fieldset>
              <legend class="sr-only">Query parameters</legend>
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400" aria-hidden="true">Query parameters</p>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/30"
                  @click="addQueryParameter"
                >
                  + Add parameter
                </button>
              </div>

              <div v-if="queryParameters.length" class="space-y-2">
                <div
                  v-for="(parameter, index) in queryParameters"
                  :key="parameter.id"
                  class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2"
                  role="group"
                  :aria-label="`Query parameter ${index + 1}`"
                >
                  <label :for="`query-key-${parameter.id}`" class="sr-only">Parameter {{ index + 1 }} key</label>
                  <input
                    :id="`query-key-${parameter.id}`"
                    v-model="parameter.key"
                    spellcheck="false"
                    class="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="key"
                  >
                  <span class="font-mono text-slate-400" aria-hidden="true">=</span>
                  <label :for="`query-value-${parameter.id}`" class="sr-only">Parameter {{ index + 1 }} value</label>
                  <input
                    :id="`query-value-${parameter.id}`"
                    v-model="parameter.value"
                    spellcheck="false"
                    class="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="value"
                  >
                  <button
                    type="button"
                    class="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:hover:bg-rose-950/40"
                    :aria-label="`Remove query parameter ${index + 1}`"
                    @click="removeQueryParameter(parameter.id)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                  </button>
                </div>
              </div>
              <button
                v-else
                type="button"
                class="w-full rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 transition hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:hover:bg-primary-950/20"
                @click="addQueryParameter"
              >
                This URL has no query parameters. Add one.
              </button>
            </fieldset>
          </div>
        </section>
      </template>

      <template #right-pane>
        <section class="flex h-full min-h-0 flex-col" aria-labelledby="url-output-heading">
          <div class="border-b border-slate-100 p-5 dark:border-slate-800">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <p class="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">Live output</p>
                <h2 id="url-output-heading" class="text-lg font-bold text-slate-900 dark:text-white">Rebuilt URL</h2>
              </div>
              <button
                type="button"
                :disabled="!builtURL"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-300 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                @click="copyValue(builtURL, 'Rebuilt URL')"
              >
                Copy URL
              </button>
            </div>
            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-4 shadow-inner dark:border-slate-700">
              <div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-sky-400 to-primary-500" aria-hidden="true"></div>
              <p v-if="builtURL" class="break-all font-mono text-sm leading-6 text-emerald-100" aria-live="polite">{{ builtURL }}</p>
              <p v-else class="font-mono text-sm text-rose-300" role="alert">{{ buildError }}</p>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{{ editableParts.protocol || '—' }} protocol</span>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{{ activeQueryCount }} query {{ activeQueryCount === 1 ? 'item' : 'items' }}</span>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{{ editableParts.hash ? 'fragment set' : 'no fragment' }}</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-5">
            <div class="mb-5">
              <p class="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">Codec</p>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">Encode or decode</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose whether separators should stay readable or be treated as data.</p>
            </div>

            <fieldset class="mb-4">
              <legend class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Encoding scope</legend>
              <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800" role="radiogroup">
                <label
                  v-for="option in codecModes"
                  :key="option.value"
                  class="cursor-pointer rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition focus-within:ring-2 focus-within:ring-primary-500"
                  :class="codecMode === option.value ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
                >
                  <input v-model="codecMode" class="sr-only" type="radio" name="codec-mode" :value="option.value">
                  {{ option.label }}
                </label>
              </div>
              <p class="mt-2 text-xs text-slate-400">{{ codecModeDescription }}</p>
            </fieldset>

            <div class="space-y-4">
              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label for="codec-input" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Input</label>
                  <button type="button" class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline" @click="useBuiltURL">Use rebuilt URL</button>
                </div>
                <textarea
                  id="codec-input"
                  v-model="codecInput"
                  rows="5"
                  spellcheck="false"
                  class="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
                  placeholder="Paste a URL or component"
                  :aria-describedby="codecError ? 'codec-error' : undefined"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button type="button" class="rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20" @click="runCodec('encode')">Encode</button>
                <button type="button" class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" @click="runCodec('decode')">Decode</button>
              </div>
              <p v-if="codecError" id="codec-error" class="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">{{ codecError }}</p>

              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label for="codec-output" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Output</label>
                  <div class="flex items-center gap-3">
                    <button type="button" :disabled="!codecOutput" class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-40" @click="swapCodecValues">Swap</button>
                    <button type="button" :disabled="!codecOutput" class="text-xs font-semibold text-slate-400 transition hover:text-primary-600 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-40" @click="copyValue(codecOutput, 'Codec output')">Copy</button>
                  </div>
                </div>
                <textarea
                  id="codec-output"
                  :value="codecOutput"
                  rows="5"
                  readonly
                  spellcheck="false"
                  class="w-full resize-y rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-sky-100 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700"
                  placeholder="Encoded or decoded output appears here"
                ></textarea>
              </div>
            </div>
          </div>

          <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
        </section>
      </template>
    </TwoPaneLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import {
  buildURL,
  decodeURL,
  encodeURL,
  parseURL,
  type QueryParameter,
  type URLCodecMode,
  type URLParts,
} from '@/utilities/URLWorkbench'

interface EditableQueryParameter extends QueryParameter {
  id: number
}

type CodecAction = 'encode' | 'decode'

const EXAMPLE_URL = 'https://api.example.com:8443/v1/users?role=admin&role=editor&limit=20#response'
const initialParts = parseURL(EXAMPLE_URL)

let nextParameterId = 0

const sourceURL = ref(EXAMPLE_URL)
const parseError = ref('')
const editableParts = reactive<Omit<URLParts, 'queryParameters'>>({
  protocol: initialParts.protocol,
  username: initialParts.username,
  password: initialParts.password,
  hostname: initialParts.hostname,
  port: initialParts.port,
  pathname: initialParts.pathname,
  hash: initialParts.hash,
})
const queryParameters = ref<EditableQueryParameter[]>(toEditableParameters(initialParts.queryParameters))

const codecModes: Array<{ value: URLCodecMode; label: string }> = [
  { value: 'full', label: 'Full URL' },
  { value: 'component', label: 'Component' },
]
const codecMode = ref<URLCodecMode>('full')
const codecInput = ref(EXAMPLE_URL)
const codecOutput = ref('')
const codecError = ref('')
const liveMessage = ref('')

const activeQueryParameters = computed<QueryParameter[]>(() => queryParameters.value
  .filter(parameter => parameter.key !== '' || parameter.value !== '')
  .map(({ key, value }) => ({ key, value })))

const activeQueryCount = computed(() => activeQueryParameters.value.length)

const buildState = computed<{ url: string; error: string }>(() => {
  try {
    return {
      url: buildURL({
        ...editableParts,
        queryParameters: activeQueryParameters.value,
      }),
      error: '',
    }
  } catch (error) {
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Unable to build this URL.',
    }
  }
})

const builtURL = computed(() => buildState.value.url)
const buildError = computed(() => buildState.value.error)
const codecModeDescription = computed(() => codecMode.value === 'full'
  ? 'Preserves URL separators such as :, /, ?, &, =, and #.'
  : 'Encodes separators too—ideal for query values, path segments, and form fields.')

function toEditableParameters(parameters: QueryParameter[]): EditableQueryParameter[] {
  return parameters.map(parameter => ({
    ...parameter,
    id: nextParameterId++,
  }))
}

function applyParts(parts: URLParts): void {
  editableParts.protocol = parts.protocol
  editableParts.username = parts.username
  editableParts.password = parts.password
  editableParts.hostname = parts.hostname
  editableParts.port = parts.port
  editableParts.pathname = parts.pathname
  editableParts.hash = parts.hash
  queryParameters.value = toEditableParameters(parts.queryParameters)
}

function parseSourceURL(): void {
  try {
    applyParts(parseURL(sourceURL.value))
    parseError.value = ''
    liveMessage.value = 'URL parsed into editable fields.'
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : 'Unable to parse this URL.'
  }
}

function loadExample(): void {
  sourceURL.value = EXAMPLE_URL
  parseSourceURL()
}

function addQueryParameter(): void {
  queryParameters.value.push({ id: nextParameterId++, key: '', value: '' })
}

function removeQueryParameter(id: number): void {
  queryParameters.value = queryParameters.value.filter(parameter => parameter.id !== id)
}

function runCodec(action: CodecAction): void {
  try {
    codecOutput.value = action === 'encode'
      ? encodeURL(codecInput.value, codecMode.value)
      : decodeURL(codecInput.value, codecMode.value)
    codecError.value = ''
    liveMessage.value = `${action === 'encode' ? 'Encoded' : 'Decoded'} output is ready.`
  } catch (error) {
    codecOutput.value = ''
    codecError.value = error instanceof Error ? error.message : `Unable to ${action} this value.`
  }
}

function useBuiltURL(): void {
  if (!builtURL.value) return
  codecInput.value = builtURL.value
  codecError.value = ''
}

function swapCodecValues(): void {
  if (!codecOutput.value) return
  const previousInput = codecInput.value
  codecInput.value = codecOutput.value
  codecOutput.value = previousInput
  codecError.value = ''
  liveMessage.value = 'Codec input and output swapped.'
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
</script>
