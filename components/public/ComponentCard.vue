<script setup lang="ts">
interface Props {
  name: string
  status: string
  description?: string
  uptime: {
    day?: number
    thirtyDays?: number
    ninetyDays?: number
  }
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs: Record<string, { dot: string; text: string; badge: string }> = {
    operational: { dot: 'bg-green-500', text: 'Operational', badge: 'bg-green-500/10 text-green-400 border border-green-500/20' },
    degraded: { dot: 'bg-yellow-500', text: 'Degraded', badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
    partial_outage: { dot: 'bg-orange-500', text: 'Partial Outage', badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
    major_outage: { dot: 'bg-red-500', text: 'Major Outage', badge: 'bg-red-500/10 text-red-400 border border-red-500/20' },
    maintenance: { dot: 'bg-indigo-500', text: 'Maintenance', badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
  }
  return configs[props.status] || configs.operational
})

function formatUptime(percent: number | undefined): string {
  if (percent === undefined) return 'No data'
  return `${percent.toFixed(2)}%`
}

function uptimeColor(percent: number | undefined): string {
  if (percent === undefined) return 'text-gray-500'
  if (percent >= 99) return 'text-green-400'
  if (percent >= 95) return 'text-yellow-400'
  return 'text-red-400'
}
</script>

<template>
  <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full" :class="statusConfig.dot"></div>
        <div>
          <h3 class="font-medium text-white">{{ name }}</h3>
          <p v-if="description" class="text-sm text-gray-500">{{ description }}</p>
        </div>
      </div>
      <span
        class="px-2.5 py-0.5 rounded-full text-xs font-medium"
        :class="statusConfig.badge"
      >
        {{ statusConfig.text }}
      </span>
    </div>

    <div class="mt-4 flex items-center gap-6 text-sm text-gray-400">
      <div class="flex items-center gap-1">
        <span class="text-gray-500">24h:</span>
        <span :class="uptimeColor(uptime.day)">
          {{ formatUptime(uptime.day) }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-gray-500">30d:</span>
        <span :class="uptimeColor(uptime.thirtyDays)">
          {{ formatUptime(uptime.thirtyDays) }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-gray-500">90d:</span>
        <span :class="uptimeColor(uptime.ninetyDays)">
          {{ formatUptime(uptime.ninetyDays) }}
        </span>
      </div>
    </div>
  </div>
</template>
