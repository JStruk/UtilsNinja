<template>
  <div class="mx-auto max-w-6xl space-y-6 pb-8">
    <section aria-labelledby="cron-explorer-heading">
      <div class="mb-6">
        <h2 id="cron-explorer-heading" class="text-2xl font-bold text-slate-900 dark:text-white">
          Cron Expression Explorer
        </h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Explain standard five-field cron schedules, optionally include seconds, and preview the next eight runs in an IANA timezone.
        </p>
      </div>

      <form class="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-soft dark:border-slate-800/60 dark:bg-slate-900" @submit.prevent="runExplorer">
        <div class="space-y-6 p-6 md:p-8">
          <div class="space-y-2">
            <label for="cron-expression" class="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Cron expression
            </label>
            <input
              id="cron-expression"
              v-model="expression"
              type="text"
              :maxlength="CRON_EXPRESSION_MAX_LENGTH"
              class="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-mono text-base text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
              placeholder="*/15 9-17 * * 1-5"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              aria-describedby="cron-expression-help cron-field-order"
            />
            <p id="cron-expression-help" class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Supports <code class="font-mono">*</code>, <code class="font-mono">?</code>, lists, ranges, steps, <code class="font-mono">L</code>, <code class="font-mono">#</code>, and seeded <code class="font-mono">H</code>. Named months and weekdays are accepted.
            </p>
          </div>

          <div id="cron-field-order" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700" aria-label="Cron field order">
            <div class="grid min-w-[680px] grid-cols-6 divide-x divide-slate-200 bg-slate-50 dark:divide-slate-700 dark:bg-slate-800/60">
              <div v-for="field in fieldOrder" :key="field.label" class="px-3 py-3 text-center">
                <code class="block text-lg font-bold text-primary-700 dark:text-primary-300">{{ field.symbol }}</code>
                <span class="mt-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{{ field.label }}</span>
                <span v-if="field.optional" class="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Optional</span>
              </div>
            </div>
          </div>

          <fieldset>
            <legend class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Common examples</legend>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="example in examples"
                :key="example.expression"
                type="button"
                class="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm font-medium text-slate-600 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                @click="applyExample(example.expression)"
              >
                <span class="block">{{ example.label }}</span>
                <code class="mt-0.5 block text-xs text-slate-400">{{ example.expression }}</code>
              </button>
            </div>
          </fieldset>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div class="space-y-2">
              <label for="cron-timezone" class="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                IANA timezone
              </label>
              <input
                id="cron-timezone"
                v-model="timeZone"
                type="text"
                list="cron-timezone-options"
                class="min-h-12 w-full rounded-2xl border bg-slate-50 px-5 py-3 font-mono text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                :class="timeZoneTouched && !timeZoneIsValid
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700'
                  : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-700'"
                :aria-invalid="timeZoneTouched && !timeZoneIsValid"
                aria-describedby="cron-timezone-help cron-timezone-error"
                autocomplete="off"
                spellcheck="false"
                @blur="timeZoneTouched = true"
              />
              <datalist id="cron-timezone-options">
                <option v-for="zone in COMMON_TIME_ZONES" :key="zone" :value="zone" />
              </datalist>
              <p id="cron-timezone-help" class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Choose a common zone or enter another IANA identifier such as <code class="font-mono">America/Toronto</code>.
              </p>
              <p v-if="timeZoneTouched && !timeZoneIsValid" id="cron-timezone-error" class="text-sm text-rose-600 dark:text-rose-400" role="alert">
                Enter a timezone recognized by this browser.
              </p>
            </div>

            <button
              type="submit"
              class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
              :disabled="isProcessing"
            >
              <svg v-if="isProcessing" class="h-5 w-5 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
                <path class="opacity-75" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
              </svg>
              {{ isProcessing ? 'Calculating…' : 'Explore schedule' }}
            </button>
          </div>

          <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
            {{ errorMessage }}
          </div>
        </div>
      </form>
    </section>

    <section v-if="result" class="space-y-5" aria-labelledby="cron-results-heading" :aria-busy="isProcessing">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="cron-results-heading" class="text-xl font-bold text-slate-900 dark:text-white">Schedule explanation</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Evaluated from {{ formatExecution(result.evaluatedFrom) }} in {{ result.timeZone }}.
          </p>
        </div>
        <button
          type="button"
          class="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="copySchedule"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Copy schedule
        </button>
      </div>

      <div class="rounded-3xl border border-primary-200 bg-primary-50 p-6 shadow-soft dark:border-primary-900/50 dark:bg-primary-950/30">
        <p class="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">In plain language</p>
        <p class="mt-2 text-lg font-semibold leading-relaxed text-primary-950 dark:text-primary-100">{{ result.summary }}</p>
        <div class="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span class="rounded-full bg-white/80 px-3 py-1.5 text-primary-700 dark:bg-slate-900/50 dark:text-primary-300">
            {{ result.fieldCount }} fields
          </span>
          <span class="rounded-full bg-white/80 px-3 py-1.5 text-primary-700 dark:bg-slate-900/50 dark:text-primary-300">
            {{ result.hasSeconds ? 'Explicit seconds' : 'Second 0 implied' }}
          </span>
          <span class="rounded-full bg-white/80 px-3 py-1.5 text-primary-700 dark:bg-slate-900/50 dark:text-primary-300">
            {{ result.timeZone }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="field in result.fields"
          :key="field.name"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ field.label }}</h3>
              <p class="mt-1 text-xs text-slate-400">Allowed: {{ field.allowed }}</p>
            </div>
            <div class="text-right">
              <code class="rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-bold text-primary-700 dark:bg-slate-800 dark:text-primary-300">{{ field.value }}</code>
              <span v-if="field.implicit" class="mt-2 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Implicit</span>
            </div>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ field.description }}</p>
        </article>
      </div>

      <div
        class="rounded-2xl border p-5"
        :class="result.daySemantics.warning
          ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
          : 'border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/30'"
      >
        <div class="flex gap-3">
          <svg v-if="result.daySemantics.warning" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <h3 class="font-bold" :class="result.daySemantics.warning ? 'text-amber-900 dark:text-amber-200' : 'text-sky-900 dark:text-sky-200'">
              {{ result.daySemantics.title }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed" :class="result.daySemantics.warning ? 'text-amber-800 dark:text-amber-300' : 'text-sky-800 dark:text-sky-300'">
              {{ result.daySemantics.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div class="border-b border-slate-200 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
          <h3 class="font-bold text-slate-800 dark:text-slate-100">Next {{ result.nextExecutions.length }} executions</h3>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Timezone and daylight-saving transitions are applied by cron-parser.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] border-collapse text-left text-sm">
            <caption class="sr-only">Upcoming cron execution dates</caption>
            <thead class="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th scope="col" class="w-16 px-5 py-3">Run</th>
                <th scope="col" class="px-5 py-3">In {{ result.timeZone }}</th>
                <th scope="col" class="px-5 py-3">ISO 8601</th>
                <th scope="col" class="px-5 py-3 text-right">Unix milliseconds</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="execution in result.nextExecutions" :key="execution.position" class="text-slate-700 dark:text-slate-300">
                <td class="px-5 py-4 font-bold text-primary-600 dark:text-primary-400">#{{ execution.position }}</td>
                <td class="px-5 py-4 font-medium">{{ formatExecution(execution.date) }}</td>
                <td class="px-5 py-4 font-mono text-xs">{{ execution.iso }}</td>
                <td class="px-5 py-4 text-right font-mono text-xs">{{ execution.unixMilliseconds }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        Cron dialects differ across Unix, Quartz, cloud schedulers, and CI platforms. Confirm the accepted field count and day rules in your target system before deployment.
      </p>
    </section>

    <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { toast } from 'vue3-toastify'
import {
  COMMON_TIME_ZONES,
  CRON_EXPRESSION_MAX_LENGTH,
  DEFAULT_EXECUTION_COUNT,
  exploreCron,
  getBrowserTimeZone,
  isValidTimeZone,
} from '@/utilities/CronExplorer'
import type { CronExploration } from '@/utilities/CronExplorer'

const expression = ref('*/15 9-17 * * 1-5')
const timeZone = ref(getBrowserTimeZone())
const timeZoneTouched = ref(false)
const result = shallowRef<CronExploration | null>(null)
const errorMessage = ref('')
const statusMessage = ref('')
const isProcessing = ref(false)
let explorationVersion = 0

const fieldOrder = [
  { symbol: '0', label: 'Second', optional: true },
  { symbol: '*/15', label: 'Minute', optional: false },
  { symbol: '9-17', label: 'Hour', optional: false },
  { symbol: '*', label: 'Day of month', optional: false },
  { symbol: '*', label: 'Month', optional: false },
  { symbol: '1-5', label: 'Day of week', optional: false },
]

const examples = [
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Weekdays at 09:00', expression: '0 9 * * 1-5' },
  { label: 'Daily at midnight', expression: '0 0 * * *' },
  { label: 'First day monthly at 08:00', expression: '0 8 1 * *' },
  { label: 'Every 30 seconds', expression: '*/30 * * * * *' },
]

const timeZoneIsValid = computed(() => isValidTimeZone(timeZone.value))

watch([expression, timeZone], invalidateResult)

onMounted(() => {
  void runExplorer()
})

function invalidateResult() {
  explorationVersion += 1
  result.value = null
  errorMessage.value = ''
  statusMessage.value = ''
  isProcessing.value = false
}

async function runExplorer() {
  timeZoneTouched.value = true
  if (!timeZoneIsValid.value) {
    errorMessage.value = `“${timeZone.value || 'Empty timezone'}” is not a valid IANA timezone.`
    statusMessage.value = 'Schedule exploration failed because the timezone is invalid.'
    return
  }

  const currentVersion = ++explorationVersion
  isProcessing.value = true
  errorMessage.value = ''
  statusMessage.value = 'Calculating future cron executions.'

  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 0))

  try {
    const exploration = exploreCron(expression.value, {
      timeZone: timeZone.value,
      currentDate: new Date(),
      executionCount: DEFAULT_EXECUTION_COUNT,
    })

    if (currentVersion !== explorationVersion) return
    result.value = exploration
    statusMessage.value = `Schedule parsed successfully. ${exploration.nextExecutions.length} future executions calculated.`
  } catch (error: unknown) {
    if (currentVersion !== explorationVersion) return
    errorMessage.value = error instanceof Error ? error.message : 'Unable to explore this cron expression.'
    statusMessage.value = 'Schedule exploration failed.'
  } finally {
    if (currentVersion === explorationVersion) isProcessing.value = false
  }
}

async function applyExample(value: string) {
  expression.value = value
  await nextTick()
  await runExplorer()
}

function formatExecution(date: Date): string {
  const zone = result.value?.timeZone ?? timeZone.value
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  }).format(date)
}

async function copySchedule() {
  if (!result.value) return

  const text = [
    `Cron: ${result.value.expression}`,
    `Timezone: ${result.value.timeZone}`,
    result.value.summary,
    '',
    ...result.value.nextExecutions.map(execution => `${execution.position}. ${execution.iso}`),
  ].join('\n')

  try {
    if (!navigator.clipboard) throw new Error('Clipboard access is unavailable in this browser.')
    await navigator.clipboard.writeText(text)
    statusMessage.value = 'Cron schedule copied to the clipboard.'
    toast.success('Schedule copied to clipboard', { autoClose: 2000 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to copy the schedule.'
    errorMessage.value = message
    statusMessage.value = 'Copy failed.'
    toast.error(message, { autoClose: 3000 })
  }
}
</script>
