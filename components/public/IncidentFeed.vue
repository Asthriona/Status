<script setup lang="ts">
interface Incident {
  id: string
  title: string
  status: string
  impact: string
  components: { id: string; name: string }[]
  updates: {
    message: string
    status: string
    createdAt: string
  }[]
  createdAt: string
  resolvedAt?: string
}

interface Props {
  incidents: Incident[]
}

defineProps<Props>()

const statusConfig: Record<string, { badge: string; label: string }> = {
  investigating: { badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', label: 'Investigating' },
  identified: { badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', label: 'Identified' },
  monitoring: { badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', label: 'Monitoring' },
  resolved: { badge: 'bg-green-500/10 text-green-400 border border-green-500/20', label: 'Resolved' },
  scheduled: { badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', label: 'Scheduled' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div v-if="incidents.length > 0" class="space-y-4">
    <div
      v-for="incident in incidents"
      :key="incident.id"
      class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-4"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-medium text-white">{{ incident.title }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="statusConfig[incident.status]?.badge || 'bg-white/5 text-gray-400 border border-white/5'"
            >
              {{ statusConfig[incident.status]?.label || incident.status }}
            </span>
            <span v-if="incident.impact !== 'none'" class="text-xs text-gray-500">
              Impact: {{ incident.impact }}
            </span>
          </div>
        </div>
        <span class="text-xs text-gray-500">{{ formatDate(incident.createdAt) }}</span>
      </div>

      <div v-if="incident.components?.length" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="comp in incident.components"
          :key="comp.id"
          class="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs border border-white/5"
        >
          {{ comp.name }}
        </span>
      </div>

      <div v-if="incident.updates?.length" class="mt-4 space-y-3">
        <div
          v-for="(update, index) in incident.updates"
          :key="index"
          class="flex gap-3"
        >
          <div class="relative">
            <div
              class="w-2 h-2 rounded-full mt-1.5"
              :class="update.status === 'resolved' ? 'bg-green-500' : 'bg-cyan-500'"
            ></div>
            <div
              v-if="index < incident.updates.length - 1"
              class="absolute top-4 left-0.5 w-0.5 h-full bg-white/10"
            ></div>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-white">
                {{ statusConfig[update.status]?.label || update.status }}
              </span>
              <span class="text-xs text-gray-500">{{ formatDate(update.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-400 mt-0.5">{{ update.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-8 text-center">
    <p class="text-gray-500">No recent incidents</p>
  </div>
</template>
