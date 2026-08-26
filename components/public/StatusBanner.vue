<script setup lang="ts">
interface Props {
  status: string
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs: Record<string, { bg: string; text: string; icon: string }> = {
    operational: { bg: 'bg-green-500/90', text: 'All Systems Operational', icon: '✓' },
    degraded: { bg: 'bg-yellow-500/90', text: 'Degraded Performance', icon: '⚠' },
    partial_outage: { bg: 'bg-orange-500/90', text: 'Partial System Outage', icon: '⚠' },
    major_outage: { bg: 'bg-red-500/90', text: 'Major System Outage', icon: '✕' },
    maintenance: { bg: 'bg-indigo-500/90', text: 'Under Maintenance', icon: '🔧' },
  }
  return configs[props.status] || configs.operational
})
</script>

<template>
  <div
    class="px-6 py-4 text-white font-medium flex items-center gap-2 backdrop-blur-sm"
    :class="statusConfig.bg"
  >
    <span class="text-lg">{{ statusConfig.icon }}</span>
    <span>{{ statusConfig.text }}</span>
  </div>
</template>
