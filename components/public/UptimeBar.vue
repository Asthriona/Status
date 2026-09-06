<script setup lang="ts">
interface DayData {
  date: string
  uptime: number | null
}

interface Props {
  data?: DayData[]
  days?: number
}

const props = withDefaults(defineProps<Props>(), {
  days: 90,
})

const hasData = computed(() => (props.data?.length || 0) > 0)

const bars = computed(() => {
  if (hasData.value) {
    return props.data as DayData[]
  }
  return Array.from({ length: props.days }, () => ({ date: '', uptime: null }))
})

function getBarColor(uptime: number | null): string {
  if (uptime === null) return 'bg-slate-700'
  if (uptime >= 99) return 'bg-green-500'
  if (uptime >= 95) return 'bg-yellow-400'
  if (uptime >= 90) return 'bg-orange-400'
  return 'bg-red-500'
}

function formatDate(date: string, index: number): string {
  if (date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const d = new Date()
  d.setDate(d.getDate() - (props.days - index - 1))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>{{ days }} days ago</span>
      <span>Today</span>
    </div>

    <div class="relative flex gap-0.5 h-8">
      <div
        v-for="(day, index) in bars"
        :key="index"
        class="flex-1 rounded-sm transition-all hover:scale-y-110 group relative"
        :class="getBarColor(day.uptime)"
      >
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10">
          <div class="font-medium">{{ formatDate(day.date, index) }}</div>
          <div>{{ day.uptime === null ? 'No data' : `${day.uptime.toFixed(2)}% uptime` }}</div>
        </div>
      </div>

      <div v-if="!hasData" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-xs text-gray-500">No data available</span>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500">
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-sm bg-green-500"></div>
        <span>≥99%</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-sm bg-yellow-400"></div>
        <span>≥95%</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-sm bg-orange-400"></div>
        <span>≥90%</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-sm bg-red-500"></div>
        <span>&lt;90%</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-sm bg-slate-700"></div>
        <span>No data</span>
      </div>
    </div>
  </div>
</template>