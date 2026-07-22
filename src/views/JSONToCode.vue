<template>
  <TwoPaneLayout>
    <template #left-pane>
      <section class="flex h-full min-h-0 flex-col" aria-labelledby="json-code-input-heading">
        <div class="border-b bg-white px-5 py-4 dark:bg-slate-900">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">Model source</p>
              <h2 id="json-code-input-heading" class="mt-1 font-semibold text-slate-800 dark:text-slate-100">JSON sample</h2>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Objects in arrays are merged to infer optional fields.</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                @click="loadSample"
              >
                Use sample
              </button>
              <button
                type="button"
                class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                @click="input = ''"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-4 border-b bg-slate-50/70 p-5 dark:bg-slate-950/20 sm:grid-cols-[1fr_12rem]">
          <fieldset>
            <legend class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target language</legend>
            <div class="grid grid-cols-3 gap-2 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="group" aria-label="Target language">
              <button
                v-for="option in languageOptions"
                :key="option.value"
                type="button"
                :aria-pressed="language === option.value"
                class="min-h-11 rounded-lg px-2 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="language === option.value
                  ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'"
                @click="language = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </fieldset>

          <div>
            <label for="json-code-root-name" class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Root type</label>
            <input
              id="json-code-root-name"
              v-model="rootName"
              type="text"
              maxlength="80"
              autocomplete="off"
              spellcheck="false"
              class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Root"
            />
          </div>
        </div>

        <div class="relative min-h-[300px] flex-1 overflow-hidden">
          <label for="json-code-input" class="sr-only">JSON sample to convert into code</label>
          <textarea
            id="json-code-input"
            v-model="input"
            :maxlength="JSON_TO_CODE_LIMITS.maxInputLength"
            :aria-invalid="Boolean(errorMessage)"
            :aria-describedby="errorMessage ? 'json-code-error' : 'json-code-help'"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            class="h-full w-full resize-none bg-transparent p-6 font-mono text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:text-slate-200 dark:placeholder:text-slate-700"
            placeholder="Paste a representative JSON object or array…"
          />
        </div>

        <div class="border-t bg-white px-5 py-3 dark:bg-slate-900">
          <p v-if="errorMessage" id="json-code-error" class="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">
            {{ errorMessage }}
          </p>
          <p v-else id="json-code-help" class="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Generated locally from the supplied sample; review inferred types before production use.</span>
            <span class="shrink-0 font-mono">{{ input.length.toLocaleString() }} / {{ JSON_TO_CODE_LIMITS.maxInputLength.toLocaleString() }}</span>
          </p>
        </div>
      </section>
    </template>

    <template #right-pane>
      <section class="flex h-full min-h-0 flex-col" aria-labelledby="json-code-output-heading">
        <div
          class="border-b px-5 py-4 transition-colors"
          :class="result ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : errorMessage ? 'bg-rose-50/60 dark:bg-rose-950/20' : 'bg-white dark:bg-slate-900'"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="h-2.5 w-2.5 rounded-full" :class="result ? 'bg-emerald-500' : errorMessage ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'" aria-hidden="true"></span>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Generated model</p>
                <h2 id="json-code-output-heading" class="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                  {{ result ? `${languageLabel} · ${result.rootName}` : 'Waiting for valid JSON' }}
                </h2>
              </div>
            </div>

            <button
              v-if="result"
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
              @click="copyCode"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy code
            </button>
          </div>
        </div>

        <div v-if="result" class="flex min-h-0 flex-1 flex-col bg-slate-950">
          <div class="flex items-center justify-between border-b border-slate-800 px-5 py-2.5 text-xs">
            <span class="font-mono text-slate-500">models.{{ fileExtension }}</span>
            <span class="rounded-md bg-slate-800 px-2 py-1 font-semibold text-slate-300">
              {{ result.definitionCount }} definition{{ result.definitionCount === 1 ? '' : 's' }}
            </span>
          </div>
          <label for="json-code-output" class="sr-only">Generated {{ languageLabel }} code</label>
          <textarea
            id="json-code-output"
            :value="result.code"
            readonly
            spellcheck="false"
            class="min-h-0 flex-1 resize-none bg-transparent p-6 font-mono text-sm leading-6 text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
          />
        </div>

        <div v-else class="flex flex-1 items-center justify-center bg-slate-50/30 p-8 text-center dark:bg-slate-950/10">
          <div class="max-w-sm">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white font-mono text-xl font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              &lt;/&gt;
            </div>
            <p class="mt-4 font-semibold text-slate-700 dark:text-slate-200">Code appears here</p>
            <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Provide representative JSON to infer nested models, arrays, nullable values, and optional fields.</p>
          </div>
        </div>

        <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>
      </section>
    </template>
  </TwoPaneLayout>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import {
  generateCodeFromJSON,
  JSON_TO_CODE_LIMITS,
} from '@/utilities/JSONToCode'
import type { CodeLanguage, GeneratedCode } from '@/utilities/JSONToCode'

const SAMPLE = `[
  {
    "id": 1,
    "display_name": "Ninja",
    "active": true,
    "profile": {
      "website": "https://utils.ninja"
    },
    "roles": ["admin", "developer"]
  },
  {
    "id": 2,
    "display_name": "Shinobi",
    "active": false,
    "profile": null,
    "email": "shinobi@example.com",
    "roles": ["developer"]
  }
]`

const languageOptions: ReadonlyArray<{ value: CodeLanguage; label: string; extension: string }> = [
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'csharp', label: 'C#', extension: 'cs' },
  { value: 'go', label: 'Go', extension: 'go' },
]

const input = ref(SAMPLE)
const language = ref<CodeLanguage>('typescript')
const rootName = ref('Users')
const result = shallowRef<GeneratedCode | null>(null)
const errorMessage = ref('')
const statusMessage = ref('')

const selectedLanguage = computed(() => languageOptions.find(option => option.value === language.value)!)
const languageLabel = computed(() => selectedLanguage.value.label)
const fileExtension = computed(() => selectedLanguage.value.extension)

watch([input, language, rootName], generate, { immediate: true })

function generate() {
  if (!input.value.trim()) {
    result.value = null
    errorMessage.value = ''
    statusMessage.value = 'Waiting for JSON input.'
    return
  }

  try {
    result.value = generateCodeFromJSON(input.value, {
      language: language.value,
      rootName: rootName.value,
    })
    errorMessage.value = ''
    statusMessage.value = `${languageLabel.value} code generated.`
  } catch (error) {
    result.value = null
    errorMessage.value = error instanceof Error ? error.message : 'Unable to generate code from this JSON.'
    statusMessage.value = 'Code generation failed.'
  }
}

function loadSample() {
  input.value = SAMPLE
}

async function copyCode() {
  if (!result.value) return

  try {
    if (!navigator.clipboard) throw new Error('Clipboard access is unavailable in this browser.')
    await navigator.clipboard.writeText(result.value.code)
    statusMessage.value = 'Generated code copied to the clipboard.'
    toast.success('Generated code copied to clipboard', { autoClose: 2000 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to copy the generated code.'
    statusMessage.value = 'Copy failed.'
    toast.error(message, { autoClose: 3000 })
  }
}
</script>
