<script setup lang="ts">
const { statusData, loading, error, fetchStatus } = useStatus()
const { connect } = useSocket()

const config = useRuntimeConfig()
const orgId = config.public.orgId

const componentGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const component of (statusData.value?.components || [])) {
    const group = component.group || 'General'
    if (!groups[group]) groups[group] = []
    groups[group].push(component)
  }
  return groups
})

onMounted(async () => {
  await fetchStatus()
  connect(orgId)

  const { on } = useSocket()
  on('component:update', () => fetchStatus())
  on('incident:create', () => fetchStatus())
  on('incident:update', () => fetchStatus())
  on('incident:resolve', () => fetchStatus())
})
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <div class="bg-slate-950/80 backdrop-blur-sm border-b border-white/5">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-white">System Status</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-12">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-12">
      <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p class="text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Status Content -->
    <template v-else-if="statusData">
      <PublicStatusBanner :status="statusData.overallStatus" />

      <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <!-- Components -->
        <div>
          <h2 class="text-lg font-semibold text-white mb-4">Services</h2>
          <div class="space-y-6">
            <div v-for="(components, group) in componentGroups" :key="group">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">{{ group }}</h3>
              <div class="space-y-3">
                <PublicComponentCard
                  v-for="component in components"
                  :key="component._id"
                  :name="component.name"
                  :status="component.status"
                  :description="component.description"
                  :uptime="{
                    day: component.uptime?.day || 100,
                    thirtyDays: component.uptime?.thirtyDays || 100,
                    ninetyDays: component.uptime?.ninetyDays || 100,
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Uptime Bars -->
        <div>
          <h2 class="text-lg font-semibold text-white mb-4">Uptime History</h2>
          <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-4 space-y-6">
            <div v-for="(components, group) in componentGroups" :key="group">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{{ group }}</h3>
              <div class="space-y-4">
                <div
                  v-for="component in components"
                  :key="component._id"
                  class="border-b border-white/5 last:border-0 pb-4 last:pb-0"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-300">{{ component.name }}</span>
                    <span class="text-sm text-gray-500">
                      {{ (component.uptime?.ninetyDays || 100).toFixed(2) }}%
                    </span>
                  </div>
                  <PublicUptimeBar :uptime-percent="component.uptime?.ninetyDays || 100" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Incidents -->
        <div v-if="statusData.activeIncidents?.length">
          <h2 class="text-lg font-semibold text-white mb-4">Active Incidents</h2>
          <PublicIncidentFeed :incidents="statusData.activeIncidents" />
        </div>

        <!-- Monitors -->
        <div v-if="statusData.monitors?.length">
          <h2 class="text-lg font-semibold text-white mb-4">Monitors</h2>
          <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 divide-y divide-white/5">
            <div
              v-for="monitor in statusData.monitors"
              :key="monitor.id"
              class="px-4 py-3 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-2.5 h-2.5 rounded-full"
                    :class="{
                      'bg-green-500': monitor.status === 'up',
                      'bg-red-500': monitor.status === 'down',
                      'bg-yellow-500': monitor.status === 'degraded',
                    }"
                  ></div>
                  <div>
                    <span class="font-medium text-white">{{ monitor.name }}</span>
                    <div class="text-xs text-gray-500">{{ monitor.latency }}ms</div>
                  </div>
                </div>
                <span class="text-sm text-gray-500">{{ monitor.uptime.toFixed(2) }}% uptime</span>
              </div>
              <PublicUptimeBar :uptime-percent="monitor.uptime" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-gray-500 pt-4 border-t border-white/5">
          Powered by Asthriona ltd.
        </div>
      </div>
    </template>
  </div>
</template>
