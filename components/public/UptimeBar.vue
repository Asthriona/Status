<script setup lang="ts">
interface Props {
  uptimePercent: number
  days?: number
}

const props = withDefaults(defineProps<Props>(), {
  days: 90,
})

// Generate mock daily data based on overall uptime
// In production, this would come from the API
const dailyData = computed(() => {
  const data: { day: number; uptime: number }[] = []
  const baseUptime = props.uptimePercent

  for (let i = 0; i < props.days; i++) {
    // Simulate some variation
    const variation = (Math.random() - 0.5) * 2
    let uptime = baseUptime + variation
    
    // Occasional bad days
    if (Math.random() < 0.05) {
      uptime = Math.max(85, uptime - 10)
    }

    data.push({
      day: i + 1,
      uptime: Math.min(100, Math.max(0, uptime)),
    })
  }

  return data
})

function getBarColor(uptime: number): string {
  if (uptime >= 99) return 'bg-green-500'
  if (uptime >= 95) return 'bg-yellow-400'
  if (uptime >= 90) return 'bg-orange-400'
  return 'bg-red-500'
}

function formatDate(index: number): string {
  const date = new Date()
  date.setDate(date.getDate() - (props.days - index - 1))
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>{{ days }} days ago</span>
      <span>Today</span>
    </div>
    
    <div class="flex gap-0.5 h-8">
      <div
        v-for="(day, index) in dailyData"
        :key="index"
        class="flex-1 rounded-sm cursor-pointer transition-all hover:scale-y-110 group relative"
        :class="getBarColor(day.uptime)"
      >
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          <div class="font-medium">{{ formatDate(index) }}</div>
          <div>{{ day.uptime.toFixed(2) }}% uptime</div>
        </div>
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
    </div>
  </div>
</template>
