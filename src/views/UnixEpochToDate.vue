<template>
  <TwoPaneLayout>
    <template v-slot:left-pane>
      <div class="flex-1 rounded-lg p-2 min-h-1/2 h-full">
        <span>Enter timestamp:</span>
        <input
            v-model="inputText"
            @input="formatDate"
            type="text"
            placeholder="Timestamp"
            class="w-full border border-gray-400 rounded-lg p-2"
        />
      </div>
    </template>
    <template v-slot:right-pane>
      <div class="flex-1 p-2 h-full overflow-scroll">
        <span>Formatted Dates: (valid: {{ isTimestampValid }})</span>
        <div class="border border-gray-400 rounded-lg p-4">
          <vue-json-pretty
              showLineNumber
              showLine
              showIcon
              :data="formattedDate"
          />
        </div>
      </div>
    </template>
  </TwoPaneLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { unixEpochToDate } from '@/utilities/UnixEpochToDate'
import TwoPaneLayout from '@/Layouts/TwoPaneLayout.vue'

const inputText = ref<string>('')
const isTimestampValid = ref<boolean>(false)
const formattedDate = ref()

function formatDate() {
  try {
    formattedDate.value = unixEpochToDate(parseInt(inputText.value))
    isTimestampValid.value = true
  } catch (e) {
    isTimestampValid.value = false
  }
}

</script>

<style>

</style>
