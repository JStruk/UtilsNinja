<template>
  <TwoPaneLayout>
    <template #left-pane>
      <section class="flex h-full min-h-0 flex-col" aria-labelledby="cidr-input-heading">
        <div class="border-b bg-white px-6 py-4 dark:bg-slate-900">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">IPv4 network</p>
          <h2 id="cidr-input-heading" class="mt-1 font-semibold text-slate-800 dark:text-slate-100">Address and subnet</h2>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            <div>
              <label for="ipv4-address" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                IPv4 address
              </label>
              <input
                id="ipv4-address"
                v-model="addressInput"
                :aria-describedby="errorMessage ? 'address-help cidr-error' : 'address-help'"
                :aria-invalid="Boolean(errorMessage)"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder="192.168.10.42 or 192.168.10.42/24"
                class="mt-2 w-full rounded-2xl border-2 bg-slate-50 px-4 py-3.5 font-mono text-base font-semibold text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
              />
              <p id="address-help" class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Add a slash prefix or provide the prefix or dotted mask below.
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3">
                <label for="subnet-mask" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prefix or subnet mask
                </label>
                <span v-if="usesInlinePrefix" class="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                  Using inline prefix
                </span>
              </div>
              <input
                id="subnet-mask"
                v-model="maskInput"
                :disabled="usesInlinePrefix"
                autocomplete="off"
                spellcheck="false"
                placeholder="24 or 255.255.255.0"
                class="mt-2 w-full rounded-2xl border-2 bg-slate-50 px-4 py-3.5 font-mono text-base text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
              />
            </div>

            <fieldset>
              <legend class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Common prefixes</legend>
              <div class="mt-2 grid grid-cols-6 gap-2">
                <button
                  v-for="prefix in commonPrefixes"
                  :key="prefix"
                  type="button"
                  class="rounded-xl border bg-white px-2 py-2 font-mono text-xs font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
                  @click="applyPrefix(prefix)"
                >
                  /{{ prefix }}
                </button>
              </div>
            </fieldset>

            <div v-if="errorMessage" id="cidr-error" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/25">
              <div class="flex items-start gap-3">
                <svg class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <div>
                  <h3 class="font-semibold text-rose-800 dark:text-rose-300">Check the network input</h3>
                  <p class="mt-1 font-mono text-sm leading-6 text-rose-700 dark:text-rose-400">{{ errorMessage }}</p>
                </div>
              </div>
            </div>

            <div v-if="calculation" class="overflow-hidden rounded-2xl border bg-slate-950 text-slate-100 shadow-xl shadow-slate-950/10">
              <div class="border-b border-slate-800 px-5 py-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Network bits</p>
                    <p class="mt-1 font-mono text-sm font-semibold">/{{ calculation.prefixLength }} network · {{ 32 - calculation.prefixLength }} host</p>
                  </div>
                  <span class="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs text-emerald-300">{{ roleLabel }}</span>
                </div>
              </div>

              <div class="p-5">
                <div
                  class="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 sm:grid-cols-[repeat(32,minmax(0,1fr))]"
                  role="img"
                  :aria-label="`${calculation.prefixLength} network bits and ${32 - calculation.prefixLength} host bits`"
                >
                  <span
                    v-for="bit in 32"
                    :key="bit"
                    class="h-7 rounded-sm border"
                    :class="bit <= calculation.prefixLength
                      ? 'border-primary-400/40 bg-primary-500/80'
                      : 'border-slate-700 bg-slate-800'"
                    aria-hidden="true"
                  ></span>
                </div>
                <div class="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span class="text-primary-300">Network</span>
                  <span>Host</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-2 border-t bg-white px-5 py-3 text-xs leading-5 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          All calculations run locally with unsigned 32-bit IPv4 arithmetic.
        </div>
      </section>
    </template>

    <template #right-pane>
      <section class="flex h-full min-h-0 flex-col" aria-labelledby="cidr-results-heading">
        <div
          class="border-b px-6 py-4 transition-colors"
          :class="calculation ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : errorMessage ? 'bg-rose-50/60 dark:bg-rose-950/20' : 'bg-white dark:bg-slate-900'"
        >
          <div class="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <div class="flex items-center gap-3">
              <span class="h-2.5 w-2.5 rounded-full" :class="calculation ? 'bg-emerald-500' : errorMessage ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'" aria-hidden="true"></span>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Calculated range</p>
                <h2
                  id="cidr-results-heading"
                  class="mt-1 font-semibold"
                  :class="calculation ? 'text-emerald-700 dark:text-emerald-400' : errorMessage ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'"
                >
                  {{ calculation?.networkCIDR || 'Waiting for a valid subnet' }}
                </h2>
              </div>
            </div>
            <button
              v-if="calculation"
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
              @click="copySummary"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy summary
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-slate-50/30 p-5 dark:bg-slate-950/10">
          <div v-if="calculation" class="space-y-5">
            <div
              class="rounded-2xl border p-4"
              :class="calculation.mode === 'point-to-point'
                ? 'border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/25'
                : calculation.mode === 'single-host'
                  ? 'border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/25'
                  : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/25'"
            >
              <div class="flex items-start gap-3">
                <svg class="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <div>
                  <h3 class="font-semibold text-slate-800 dark:text-slate-100">{{ semanticsTitle }}</h3>
                  <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ semanticsDescription }}</p>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <article
                v-for="item in primaryResults"
                :key="item.label"
                class="group rounded-2xl border bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md dark:bg-slate-900 dark:hover:border-primary-800"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ item.label }}</p>
                    <p class="mt-2 break-all font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">{{ item.value }}</p>
                  </div>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-slate-300 opacity-100 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 dark:hover:bg-primary-950/40 dark:hover:text-primary-300"
                    :aria-label="`Copy ${item.label.toLowerCase()}`"
                    @click="copyValue(item.label, item.value)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                </div>
              </article>
            </div>

            <article class="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
              <div class="border-b px-5 py-3.5">
                <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Capacity</h3>
              </div>
              <dl class="grid grid-cols-2 divide-x dark:divide-slate-800">
                <div class="p-5">
                  <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total addresses</dt>
                  <dd class="mt-2 text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">{{ formatCount(calculation.totalAddressCount) }}</dd>
                </div>
                <div class="p-5">
                  <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Usable hosts</dt>
                  <dd class="mt-2 text-xl font-bold tabular-nums text-primary-700 dark:text-primary-400">{{ formatCount(calculation.usableHostCount) }}</dd>
                </div>
              </dl>
            </article>

            <article class="overflow-hidden rounded-2xl border bg-slate-950 text-slate-200 shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
                <h3 class="text-sm font-semibold text-white">Binary view</h3>
                <span class="font-mono text-[10px] uppercase tracking-wider text-slate-500">8 · 8 · 8 · 8 bits</span>
              </div>
              <dl class="divide-y divide-slate-800">
                <div v-for="item in binaryResults" :key="item.label" class="px-5 py-3">
                  <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ item.label }}</dt>
                  <dd class="mt-1 overflow-x-auto whitespace-nowrap font-mono text-xs leading-6 text-emerald-300">{{ item.value }}</dd>
                </div>
              </dl>
            </article>

            <article class="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Optional</p>
                  <h3 class="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Split into smaller subnets</h3>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="showSplitter"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  :class="showSplitter ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'"
                  @click="showSplitter = !showSplitter"
                >
                  <span class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform" :class="showSplitter ? 'translate-x-6' : 'translate-x-1'"></span>
                  <span class="sr-only">Toggle subnet splitting</span>
                </button>
              </div>

              <div v-if="showSplitter" class="p-5">
                <div v-if="calculation.prefixLength < 32" class="space-y-4">
                  <label for="split-prefix" class="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    New prefix
                    <span class="font-mono text-primary-700 dark:text-primary-400">/{{ splitPrefix }}</span>
                    <input
                      id="split-prefix"
                      v-model.number="splitPrefix"
                      type="range"
                      :min="calculation.prefixLength"
                      max="32"
                      class="min-w-[180px] flex-1 accent-primary-600"
                    />
                  </label>

                  <div v-if="splitState.result" class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-slate-800/60">
                      <span class="font-semibold text-slate-600 dark:text-slate-300">
                        {{ formatCount(splitState.result.totalSubnets) }} subnet{{ splitState.result.totalSubnets === 1 ? '' : 's' }}
                      </span>
                      <span v-if="splitState.result.truncated" class="text-slate-500 dark:text-slate-400">Showing first {{ splitState.result.subnets.length }}</span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border">
                      <table class="w-full min-w-[540px] text-left text-xs">
                        <thead class="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/70">
                          <tr>
                            <th class="px-4 py-2.5 font-bold">Subnet</th>
                            <th class="px-4 py-2.5 font-bold">Usable range</th>
                            <th class="px-4 py-2.5 text-right font-bold">Hosts</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y font-mono dark:divide-slate-800">
                          <tr v-for="subnet in splitState.result.subnets" :key="subnet.cidr">
                            <td class="px-4 py-3 font-semibold text-primary-700 dark:text-primary-400">{{ subnet.cidr }}</td>
                            <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ subnet.firstUsableAddress }} – {{ subnet.lastUsableAddress }}</td>
                            <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatCount(subnet.usableHostCount) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p v-if="splitState.error" role="alert" class="text-xs text-rose-600 dark:text-rose-400">{{ splitState.error }}</p>
                </div>
                <p v-else class="text-sm leading-6 text-slate-500 dark:text-slate-400">A /32 already represents a single address and cannot be divided further.</p>
              </div>
            </article>
          </div>

          <div v-else class="flex min-h-[420px] items-center justify-center p-8 text-center">
            <div class="max-w-xs">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 text-slate-400 dark:border-slate-700 dark:bg-slate-900/50">
                <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect width="8" height="8" x="3" y="3" rx="2" />
                  <rect width="8" height="8" x="13" y="13" rx="2" />
                  <path d="M11 7h2a4 4 0 0 1 4 4v2M7 11v2a4 4 0 0 0 4 4h2" />
                </svg>
              </div>
              <p class="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Network details appear here</p>
              <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Enter a valid IPv4 address and subnet to calculate its complete range.</p>
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
  calculateCIDR,
  splitCIDR,
  type CIDRCalculation,
  type CIDRSplitResult,
} from '@/utilities/CIDRCalculator'

const addressInput = ref('192.168.10.42')
const maskInput = ref('24')
const calculation = ref<CIDRCalculation | null>(null)
const errorMessage = ref('')
const showSplitter = ref(false)
const splitPrefix = ref(26)
const previousPrefix = ref<number | null>(null)
const commonPrefixes = [8, 16, 24, 30, 31, 32]

const usesInlinePrefix = computed(() => addressInput.value.includes('/'))

const primaryResults = computed(() => calculation.value
  ? [
      { label: 'Network address', value: calculation.value.networkAddress },
      { label: 'Broadcast address', value: calculation.value.broadcastAddress },
      { label: 'First usable', value: calculation.value.firstUsableAddress },
      { label: 'Last usable', value: calculation.value.lastUsableAddress },
      { label: 'Subnet mask', value: calculation.value.subnetMask },
      { label: 'Wildcard mask', value: calculation.value.wildcardMask },
    ]
  : [])

const binaryResults = computed(() => calculation.value
  ? [
      { label: 'Input address', value: calculation.value.binary.address },
      { label: 'Subnet mask', value: calculation.value.binary.subnetMask },
      { label: 'Network', value: calculation.value.binary.network },
      { label: 'Broadcast', value: calculation.value.binary.broadcast },
      { label: 'Wildcard', value: calculation.value.binary.wildcardMask },
    ]
  : [])

const roleLabel = computed(() => {
  switch (calculation.value?.addressRole) {
    case 'network': return 'Network address'
    case 'broadcast': return 'Broadcast address'
    case 'point-to-point-endpoint': return 'P2P endpoint'
    case 'single-host': return 'Single host'
    default: return 'Usable host'
  }
})

const semanticsTitle = computed(() => {
  if (calculation.value?.mode === 'point-to-point') return '/31 point-to-point semantics'
  if (calculation.value?.mode === 'single-host') return '/32 single-host semantics'
  return 'Traditional subnet semantics'
})

const semanticsDescription = computed(() => {
  if (calculation.value?.mode === 'point-to-point') {
    return 'Both addresses are usable endpoints under RFC 3021; the upper address is shown as the bitwise broadcast boundary, not a reserved broadcast host.'
  }
  if (calculation.value?.mode === 'single-host') {
    return 'The network, broadcast, and usable range all resolve to the same single address.'
  }
  return 'The network and broadcast boundaries are reserved, so the usable range excludes those two addresses.'
})

const splitState = computed<{ result: CIDRSplitResult | null; error: string }>(() => {
  if (!calculation.value || !showSplitter.value || calculation.value.prefixLength === 32) {
    return { result: null, error: '' }
  }

  try {
    return {
      result: splitCIDR(calculation.value.networkCIDR, splitPrefix.value, 16),
      error: '',
    }
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : 'The subnet preview could not be calculated.',
    }
  }
})

watch([addressInput, maskInput], updateCalculation, { immediate: true })

function updateCalculation() {
  try {
    const nextCalculation = calculateCIDR(
      addressInput.value,
      usesInlinePrefix.value ? undefined : maskInput.value,
    )
    calculation.value = nextCalculation
    errorMessage.value = ''

    if (previousPrefix.value !== nextCalculation.prefixLength) {
      splitPrefix.value = Math.min(nextCalculation.prefixLength + 2, 32)
      previousPrefix.value = nextCalculation.prefixLength
    }
  } catch (error) {
    calculation.value = null
    errorMessage.value = error instanceof Error ? error.message : 'The subnet could not be calculated.'
  }
}

function applyPrefix(prefix: number) {
  addressInput.value = addressInput.value.split('/')[0]?.trim() || ''
  maskInput.value = String(prefix)
}

async function copyValue(label: string, value: string) {
  const result = await copyToClipboard(value)
  if (result.success) toast.success(`${label} copied to clipboard`, { autoClose: 1800 })
  else toast.error(result.error, { autoClose: 3000 })
}

async function copySummary() {
  if (!calculation.value) return

  const summary = [
    `CIDR: ${calculation.value.networkCIDR}`,
    `Subnet mask: ${calculation.value.subnetMask}`,
    `Wildcard mask: ${calculation.value.wildcardMask}`,
    `Network: ${calculation.value.networkAddress}`,
    `Broadcast: ${calculation.value.broadcastAddress}`,
    `Usable range: ${calculation.value.firstUsableAddress} - ${calculation.value.lastUsableAddress}`,
    `Total addresses: ${calculation.value.totalAddressCount}`,
    `Usable hosts: ${calculation.value.usableHostCount}`,
  ].join('\n')

  const result = await copyToClipboard(summary)
  if (result.success) toast.success('Subnet summary copied to clipboard', { autoClose: 1800 })
  else toast.error(result.error, { autoClose: 3000 })
}

function formatCount(value: number): string {
  return new Intl.NumberFormat().format(value)
}
</script>
