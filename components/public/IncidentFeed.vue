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
  investigating: { badge: 'bg-orange-100 text-orange-800', label: 'Investigating' },
  identified: { badge: 'bg-yellow-100 text-yellow-800', label: 'Identified' },
  monitoring: { badge: 'bg-blue-100 text-blue-800', label: 'Monitoring' },
  resolved: { badge: 'bg-green-100 text-green-800', label: 'Resolved' },
  scheduled: { badge: 'bg-indigo-100 text-indigo-800', label: 'Scheduled' },
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
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-medium text-gray-900">{{ incident.title }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="statusConfig[incident.status]?.badge || 'bg-gray-100 text-gray-800'"
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
          class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
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
              :class="update.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'"
            ></div>
            <div
              v-if="index < incident.updates.length - 1"
              class="absolute top-4 left-0.5 w-0.5 h-full bg-gray-200"
            ></div>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-900">
                {{ statusConfig[update.status]?.label || update.status }}
              </span>
              <span class="text-xs text-gray-500">{{ formatDate(update.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-0.5">{{ update.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
    <p class="text-gray-500">No recent incidents</p>
  </div>
</template>
