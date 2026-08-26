<script setup lang="ts">
definePageMeta({
  layout: false,
})

const token = ref('')
const components = ref<any[]>([])
const incidents = ref<any[]>([])
const monitors = ref<any[]>([])
const loading = ref(true)

onMounted(() => {
  token.value = localStorage.getItem('token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  fetchData()
})

async function fetchData() {
  try {
    const headers = { Authorization: `Bearer ${token.value}` }

    const [componentsData, incidentsData, monitorsData] = await Promise.all([
      $fetch('/api/admin/components', { headers }),
      $fetch('/api/admin/incidents', { headers }),
      $fetch('/api/admin/monitors', { headers }),
    ])

    components.value = componentsData as any[]
    incidents.value = incidentsData as any[]
    monitors.value = monitorsData as any[]
  } catch (err) {
    console.error('Failed to fetch data:', err)
    navigateTo('/admin/login')
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('token')
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-black">
    <nav class="bg-slate-950/80 backdrop-blur-sm border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <NuxtLink to="/admin" class="text-xl font-bold text-white">Status Admin</NuxtLink>
          <NuxtLink to="/admin" class="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</NuxtLink>
          <NuxtLink to="/admin/components" class="text-sm text-gray-400 hover:text-white transition-colors">Components</NuxtLink>
          <NuxtLink to="/admin/incidents" class="text-sm text-gray-400 hover:text-white transition-colors">Incidents</NuxtLink>
          <NuxtLink to="/admin/monitors" class="text-sm text-gray-400 hover:text-white transition-colors">Monitors</NuxtLink>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-sm text-cyan-400 hover:text-cyan-300 transition-colors" target="_blank">View Status Page</NuxtLink>
          <button @click="logout" class="text-sm text-gray-400 hover:text-white transition-colors">Logout</button>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
          <h2 class="text-lg font-medium text-white">Components</h2>
          <p class="text-3xl font-bold text-white mt-2">{{ components.length }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ components.filter(c => c.status === 'operational').length }} operational
          </p>
          <NuxtLink to="/admin/components" class="text-sm text-cyan-400 hover:text-cyan-300 mt-3 block transition-colors">
            Manage →
          </NuxtLink>
        </div>

        <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
          <h2 class="text-lg font-medium text-white">Active Incidents</h2>
          <p class="text-3xl font-bold text-white mt-2">
            {{ incidents.filter(i => i.status !== 'resolved').length }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ incidents.length }} total
          </p>
          <NuxtLink to="/admin/incidents" class="text-sm text-cyan-400 hover:text-cyan-300 mt-3 block transition-colors">
            Manage →
          </NuxtLink>
        </div>

        <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
          <h2 class="text-lg font-medium text-white">Monitors</h2>
          <p class="text-3xl font-bold text-white mt-2">{{ monitors.length }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ monitors.filter(m => m.currentStatus === 'up').length }} online
          </p>
          <NuxtLink to="/admin/monitors" class="text-sm text-cyan-400 hover:text-cyan-300 mt-3 block transition-colors">
            Manage →
          </NuxtLink>
        </div>
      </div>

      <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
        <h2 class="text-lg font-medium text-white mb-4">Recent Activity</h2>
        <div v-if="incidents.length === 0" class="text-gray-500 text-sm">
          No recent activity
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="incident in incidents.slice(0, 5)"
            :key="incident._id"
            class="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
          >
            <div>
              <span class="font-medium text-white">{{ incident.title }}</span>
              <span class="text-sm text-gray-500 ml-2">- {{ incident.status }}</span>
            </div>
            <span class="text-xs text-gray-500">
              {{ new Date(incident.createdAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
