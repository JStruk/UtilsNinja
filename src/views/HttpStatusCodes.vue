<template>
  <div class="max-w-6xl mx-auto py-8 px-4 lg:px-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">HTTP Status Codes</h1>
      <p class="text-slate-600 dark:text-slate-400 font-medium">A comprehensive reference for HTTP response status codes.</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm w-fit">
      <button 
        v-for="cat in categories" 
        :key="cat.value"
        @click="activeCategory = cat.value"
        class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
        :class="activeCategory === cat.value ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Status Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="status in filteredStatuses" 
        :key="status.code"
        class="group p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-4">
          <span 
            class="inline-block px-4 py-1.5 rounded-xl font-mono text-xl font-bold shadow-sm"
            :class="getTypeStyles(status.code)"
          >
            {{ status.code }}
          </span>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="copyStatus(status.code.toString())"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-500 transition-colors"
              title="Copy Code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 truncate group-hover:text-primary-500 transition-colors">
          {{ status.name }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {{ status.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { copyToClipboard } from '@/helpers/CopyToClipboard'
import { toast } from 'vue3-toastify'

const activeCategory = ref('all')

const categories = [
  { label: 'All', value: 'all' },
  { label: '1xx Informational', value: '1' },
  { label: '2xx Success', value: '2' },
  { label: '3xx Redirection', value: '3' },
  { label: '4xx Client Error', value: '4' },
  { label: '5xx Server Error', value: '5' },
]

const statusCodes = [
  // 1xx
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, name: 'Switching Protocols', description: 'The requester has asked the server to switch protocols.' },
  { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.' },
  
  // 2xx
  { code: 200, name: 'OK', description: 'The request has succeeded. This is the standard response for successful HTTP requests.' },
  { code: 201, name: 'Created', description: 'The request has been fulfilled, resulting in the creation of a new resource.' },
  { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.' },
  { code: 204, name: 'No Content', description: 'The server successfully processed the request and is not returning any content.' },
  
  // 3xx
  { code: 301, name: 'Moved Permanently', description: 'This and all future requests should be directed to the given URI.' },
  { code: 302, name: 'Found', description: 'The resource was found, but at a different URI.' },
  { code: 304, name: 'Not Modified', description: 'Indicates that the resource has not been modified since the version specified by the request headers.' },
  { code: 307, name: 'Temporary Redirect', description: 'The request should be repeated with another URI; however, future requests should still use the original URI.' },
  
  // 4xx
  { code: 400, name: 'Bad Request', description: 'The server cannot or will not process the request due to an apparent client error.' },
  { code: 401, name: 'Unauthorized', description: 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.' },
  { code: 403, name: 'Forbidden', description: 'The request was valid, but the server is refusing action. The user might not have the necessary permissions.' },
  { code: 404, name: 'Not Found', description: 'The requested resource could not be found but may be available in the future.' },
  { code: 405, name: 'Method Not Allowed', description: 'A request method is not supported for the requested resource.' },
  { code: 409, name: 'Conflict', description: 'Indicates that the request could not be processed because of conflict in the current state of the resource.' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.' },
  
  // 5xx
  { code: 500, name: 'Internal Server Error', description: 'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.' },
  { code: 501, name: 'Not Implemented', description: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request.' },
  { code: 502, name: 'Bad Gateway', description: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', description: 'The server is currently unavailable (because it is overloaded or down for maintenance).' },
  { code: 504, name: 'Gateway Timeout', description: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.' },
]

const filteredStatuses = computed(() => {
  if (activeCategory.value === 'all') return statusCodes
  return statusCodes.filter(s => s.code.toString().startsWith(activeCategory.value))
})

function getTypeStyles(code: number) {
  if (code >= 200 && code < 300) return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
  if (code >= 300 && code < 400) return 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400'
  if (code >= 400 && code < 500) return 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
  if (code >= 500) return 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
  return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

async function copyStatus(code: string) {
  const result = await copyToClipboard(code)
  if (result.success) toast.success(`Copied status ${code}`, { autoClose: 1500 })
  else toast.error(result.error, { autoClose: 3000 })
}
</script>
