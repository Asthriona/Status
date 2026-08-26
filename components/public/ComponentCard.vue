<script setup lang="ts">
interface Props {
  name: string
  status: string
  description?: string
  uptime: {
    day: number
    thirtyDays: number
    ninetyDays: number
  }
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs: Record<string, { dot: string; text: string; badge: string }> = {
    operational: { dot: 'bg-green-500', text: 'Operational', badge: 'bg-green-100 text-green-800' },
    degraded: { dot: 'bg-yellow-500', text: 'Degraded', badge: 'bg-yellow-100 text-yellow-800' },
    partial_outage: { dot: 'bg-orange-500', text: 'Partial Outage', badge: 'bg-orange-100 text-orange-800' },
    major_outage: { dot: 'bg-red-500', text: 'Major Outage', badge: 'bg-red-100 text-red-800' },
    maintenance: { dot: 'bg-indigo-500', text: 'Maintenance', badge: 'bg-indigo-100 text-indigo-800' },
  }
  return configs[props.status] || configs.operational
})

function formatUptime(percent: number): string {
  return `${percent.toFixed(2)}%`
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full" :class="statusConfig.dot"></div>
        <div>
          <h3 class="font-medium text-gray-900">{{ name }}</h3>
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

    <div class="mt-4 flex items-center gap-6 text-sm text-gray-600">
      <div class="flex items-center gap-1">
        <span class="text-gray-400">24h:</span>
        <span :class="uptime.day >= 99 ? 'text-green-600' : uptime.day >= 95 ? 'text-yellow-600' : 'text-red-600'">
          {{ formatUptime(uptime.day) }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-gray-400">30d:</span>
        <span :class="uptime.thirtyDays >= 99 ? 'text-green-600' : uptime.thirtyDays >= 95 ? 'text-yellow-600' : 'text-red-600'">
          {{ formatUptime(uptime.thirtyDays) }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-gray-400">90d:</span>
        <span :class="uptime.ninetyDays >= 99 ? 'text-green-600' : uptime.ninetyDays >= 95 ? 'text-yellow-600' : 'text-red-600'">
          {{ formatUptime(uptime.ninetyDays) }}
        </span>
      </div>
    </div>
  </div>
</template>
