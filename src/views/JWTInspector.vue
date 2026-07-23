<template>
  <TwoPaneLayout>
    <template #left-pane>
      <section class="flex h-full min-h-0 flex-col" aria-labelledby="jwt-input-heading">
        <div class="border-b bg-white px-6 py-4 dark:bg-slate-900">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="jwt-input-heading" class="font-semibold text-slate-800 dark:text-slate-100">
                Encoded token
              </h2>
              <p id="jwt-input-help" class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Paste a compact JWT with header, payload, and signature segments.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
                @click="loadSample"
              >
                Use sample
              </button>
              <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                @click="clearToken"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div class="relative min-h-[240px] flex-1 overflow-hidden bg-slate-50/40 dark:bg-slate-950/20">
          <label for="jwt-token" class="sr-only">JSON Web Token</label>
          <textarea
            id="jwt-token"
            v-model="token"
            aria-describedby="jwt-input-help jwt-privacy-note"
            aria-label="JSON Web Token"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="eyJhbGciOi...eyJzdWIiOi...signature"
            class="h-full w-full resize-none bg-transparent p-6 font-mono text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:text-slate-200 dark:placeholder:text-slate-700"
          />
        </div>

        <div class="border-t bg-white p-5 dark:bg-slate-900">
          <div class="mb-4 grid grid-cols-[1fr_1.35fr_1fr] gap-1" aria-hidden="true">
            <div class="h-1.5 rounded-l-full bg-amber-400"></div>
            <div class="h-1.5 bg-primary-500"></div>
            <div class="h-1.5 rounded-r-full bg-rose-400"></div>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Header</span>
            <span>Payload</span>
            <span>Signature</span>
          </div>
          <p id="jwt-privacy-note" class="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Decoding happens locally in your browser. The token is not sent to a server.
          </p>
        </div>
      </section>
    </template>

    <template #right-pane>
      <section class="flex h-full min-h-0 flex-col" aria-labelledby="jwt-output-heading">
        <div
          class="border-b px-6 py-4 transition-colors"
          :class="result ? statusTheme.container : errorMessage ? 'bg-rose-50/70 dark:bg-rose-950/20' : 'bg-white dark:bg-slate-900'"
        >
          <div class="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <div class="flex items-center gap-3">
              <span
                class="h-2.5 w-2.5 rounded-full shadow-sm"
                :class="result ? statusTheme.dot : errorMessage ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'"
                aria-hidden="true"
              ></span>
              <div>
                <h2
                  id="jwt-output-heading"
                  class="font-semibold"
                  :class="result ? statusTheme.text : errorMessage ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'"
                >
                  {{ result ? statusTheme.label : errorMessage ? 'Unable to decode token' : 'Waiting for a token' }}
                </h2>
                <p v-if="result" class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Evaluated {{ formatDate(result.time.evaluatedAt.iso) }}
                </p>
              </div>
            </div>
            <div v-if="result" class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span class="rounded-md border border-white/70 bg-white/70 px-2.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                {{ result.algorithm || 'Algorithm unknown' }}
              </span>
              <span v-if="result.tokenType" class="rounded-md border border-white/70 bg-white/70 px-2.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                {{ result.tokenType }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-slate-50/30 p-5 dark:bg-slate-950/10">
          <div v-if="errorMessage" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
            <div class="flex items-start gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
              <div>
                <h3 class="font-semibold text-rose-800 dark:text-rose-300">Check the token format</h3>
                <p class="mt-1 font-mono text-sm leading-6 text-rose-700 dark:text-rose-400">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="result" class="space-y-5">
            <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/25">
              <div class="flex items-start gap-3">
                <svg class="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
                <div>
                  <h3 class="font-semibold text-amber-900 dark:text-amber-200">Decoded, not verified</h3>
                  <p class="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-300">
                    {{ result.signature.message }} Anyone can alter decoded claims; only trust them after cryptographic verification by the receiving application.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <article class="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time status</p>
                <p class="mt-2 text-lg font-bold" :class="statusTheme.text">{{ statusTheme.label }}</p>
                <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ statusDescription }}</p>
              </article>
              <article class="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signature segment</p>
                <p class="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                  {{ result.signature.present ? 'Present' : 'Missing' }}
                </p>
                <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Verification status: not verified</p>
              </article>
            </div>

            <article class="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
              <div class="border-b px-5 py-3.5">
                <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Time claims</h3>
              </div>
              <dl class="divide-y dark:divide-slate-800">
                <div v-for="claim in timeClaims" :key="claim.label" class="grid gap-1 px-5 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ claim.label }}</dt>
                  <dd class="min-w-0 text-sm text-slate-700 dark:text-slate-200">
                    <span v-if="claim.value">{{ formatDate(claim.value.iso) }}</span>
                    <span v-else class="text-slate-400">Not provided</span>
                    <code v-if="claim.value" class="ml-2 text-[11px] text-slate-400">{{ claim.value.seconds }}</code>
                  </dd>
                </div>
              </dl>
            </article>

            <article v-if="registeredClaims.length" class="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
              <div class="border-b px-5 py-3.5">
                <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Registered claims</h3>
              </div>
              <dl class="divide-y dark:divide-slate-800">
                <div v-for="claim in registeredClaims" :key="claim.key" class="grid gap-1 px-5 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ claim.label }}</dt>
                  <dd class="break-words font-mono text-xs leading-5 text-slate-700 dark:text-slate-200">{{ claim.value }}</dd>
                </div>
              </dl>
            </article>

            <div v-if="result.warnings.length" class="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-200">Claim warnings</h3>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-amber-800 dark:text-amber-300">
                <li v-for="warning in result.warnings" :key="warning">{{ warning }}</li>
              </ul>
            </div>

            <article v-for="section in jsonSections" :key="section.label" class="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
              <div class="flex items-center justify-between border-b px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :class="section.dot" aria-hidden="true"></span>
                  <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ section.label }}</h3>
                </div>
                <button
                  type="button"
                  class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:hover:border-primary-700 dark:hover:text-primary-300"
                  :aria-label="`Copy decoded ${section.label.toLowerCase()}`"
                  @click="copySection(section.label, section.value)"
                >
                  Copy
                </button>
              </div>
              <pre class="max-h-72 overflow-auto p-5 font-mono text-xs leading-6 text-slate-700 dark:text-slate-300"><code>{{ JSON.stringify(section.value, null, 2) }}</code></pre>
            </article>
          </div>

          <div v-else class="flex min-h-[320px] items-center justify-center p-8 text-center">
            <div class="max-w-xs">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M4 17 10 11 4 5M12 19h8" />
                </svg>
              </div>
              <p class="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Token details appear here</p>
              <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Paste a JWT or load the sample token to inspect its decoded claims.</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </TwoPaneLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import {
  inspectJWT,
  type JWTInspectionResult,
  type JWTNumericDate,
  type JWTTemporalStatus,
} from '@/utilities/JWTInspector'

const SAMPLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik5pbmphIERldmVsb3BlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxODkzNDU2MDAwfQ.sample-signature'

const token = ref(SAMPLE_TOKEN)
const result = ref<JWTInspectionResult | null>(null)
const errorMessage = ref('')

const themes: Record<JWTTemporalStatus, {
  label: string
  container: string
  dot: string
  text: string
}> = {
  active: {
    label: 'Active by time claims',
    container: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  expired: {
    label: 'Expired',
    container: 'bg-rose-50/70 dark:bg-rose-950/20',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
  },
  'not-yet-valid': {
    label: 'Not active yet',
    container: 'bg-amber-50/70 dark:bg-amber-950/20',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  'no-expiration': {
    label: 'No expiration claim',
    container: 'bg-sky-50/70 dark:bg-sky-950/20',
    dot: 'bg-sky-500',
    text: 'text-sky-700 dark:text-sky-400',
  },
}

const statusTheme = computed(() => themes[result.value?.time.status ?? 'no-expiration'])

const statusDescription = computed(() => {
  if (!result.value) return ''

  switch (result.value.time.status) {
    case 'active':
      return result.value.time.secondsUntilExpiry === null
        ? 'No usable expiration was found.'
        : `Expires in ${formatDuration(result.value.time.secondsUntilExpiry)}.`
    case 'expired':
      return result.value.time.secondsUntilExpiry === null
        ? 'The expiration time has passed.'
        : `Expired ${formatDuration(result.value.time.secondsUntilExpiry)} ago.`
    case 'not-yet-valid':
      return 'The not-before time is still in the future.'
    case 'no-expiration':
      return 'No usable exp claim was found, so an expiration cannot be determined.'
  }

  return ''
})

const timeClaims = computed<Array<{ label: string; value: JWTNumericDate | null }>>(() => [
  { label: 'Issued at (iat)', value: result.value?.time.issuedAt ?? null },
  { label: 'Not before (nbf)', value: result.value?.time.notBefore ?? null },
  { label: 'Expires at (exp)', value: result.value?.time.expiresAt ?? null },
])

const registeredClaims = computed(() => {
  if (!result.value) return []

  const definitions = [
    { key: 'iss', label: 'Issuer (iss)' },
    { key: 'sub', label: 'Subject (sub)' },
    { key: 'aud', label: 'Audience (aud)' },
    { key: 'jti', label: 'Token ID (jti)' },
  ]

  return definitions
    .filter(({ key }) => result.value?.payload[key] !== undefined)
    .map(({ key, label }) => ({
      key,
      label,
      value: displayClaim(result.value?.payload[key]),
    }))
})

const jsonSections = computed(() => result.value
  ? [
      { label: 'Header', value: result.value.header, dot: 'bg-amber-400' },
      { label: 'Payload', value: result.value.payload, dot: 'bg-primary-500' },
    ]
  : [])

watch(token, inspectToken, { immediate: true })

function inspectToken(value: string) {
  if (!value.trim()) {
    result.value = null
    errorMessage.value = ''
    return
  }

  try {
    result.value = inspectJWT(value)
    errorMessage.value = ''
  } catch (error) {
    result.value = null
    errorMessage.value = error instanceof Error ? error.message : 'The JWT could not be decoded.'
  }
}

function loadSample() {
  token.value = SAMPLE_TOKEN
}

function clearToken() {
  token.value = ''
}

async function copySection(label: string, value: Record<string, unknown>) {
  const result = await copyToClipboard(JSON.stringify(value, null, 2))
  if (result.success) toast.success(`${label} copied to clipboard`, { autoClose: 2000 })
  else toast.error(result.error, { autoClose: 3000 })
}

function displayClaim(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(item => String(item)).join(', ')
  if (value !== null && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Date is outside the supported range'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(iso))
}

function formatDuration(seconds: number): string {
  const absoluteSeconds = Math.max(0, Math.round(Math.abs(seconds)))
  const units = [
    { label: 'day', seconds: 86_400 },
    { label: 'hour', seconds: 3_600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ]
  const unit = units.find(candidate => absoluteSeconds >= candidate.seconds) ?? units[units.length - 1]!
  const amount = Math.floor(absoluteSeconds / unit.seconds)
  return `${amount} ${unit.label}${amount === 1 ? '' : 's'}`
}
</script>
