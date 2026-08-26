<script setup lang="ts">
definePageMeta({ layout: false })

const token = ref('')
const monitors = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const checkingId = ref<string | null>(null)

const form = ref({
  name: '',
  url: '',
  type: 'http',
  method: 'GET',
  interval: 60,
  timeout: 10,
  expectedStatus: 200,
  active: true,
})

onMounted(() => {
  token.value = localStorage.getItem('token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  fetchMonitors()
})

async function fetchMonitors() {
  try {
    monitors.value = await $fetch('/api/admin/monitors', {
      headers: { Authorization: `Bearer ${token.value}` },
    }) as any[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function saveMonitor() {
  try {
    await $fetch('/api/admin/monitors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: form.value,
    })
    showModal.value = false
    form.value = { name: '', url: '', type: 'http', method: 'GET', interval: 60, timeout: 10, expectedStatus: 200, active: true }
    await fetchMonitors()
  } catch (err) {
    console.error(err)
  }
}

async function checkNow(monitorId: string) {
  checkingId.value = monitorId
  try {
    await $fetch('/api/admin/monitors/check', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { monitorId },
    })
    await fetchMonitors()
  } catch (err) {
    console.error(err)
  } finally {
    checkingId.value = null
  }
}

async function deleteMonitor(id: string) {
  if (!confirm('Delete this monitor?')) return
  try {
    await $fetch('/api/admin/monitors', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
      params: { id },
    })
    await fetchMonitors()
  } catch (err) {
    console.error(err)
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="min-h-screen bg-black">
    <nav class="bg-slate-950/80 backdrop-blur-sm border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
        <NuxtLink to="/admin" class="text-xl font-bold text-white">Status Admin</NuxtLink>
        <NuxtLink to="/admin" class="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</NuxtLink>
        <NuxtLink to="/admin/components" class="text-sm text-gray-400 hover:text-white transition-colors">Components</NuxtLink>
        <NuxtLink to="/admin/incidents" class="text-sm text-gray-400 hover:text-white transition-colors">Incidents</NuxtLink>
        <NuxtLink to="/admin/monitors" class="text-sm text-cyan-400 font-medium">Monitors</NuxtLink>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-white">Monitors</h1>
        <button
          @click="showModal = true"
          class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all"
        >
          Add Monitor
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>

      <div v-else class="space-y-4">
        <div v-if="monitors.length === 0" class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-8 text-center text-gray-500">
          No monitors configured. Add a monitor to start checking your services.
        </div>
        <div
          v-for="monitor in monitors"
          :key="monitor._id"
          class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-6"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-green-500': monitor.currentStatus === 'up',
                  'bg-red-500': monitor.currentStatus === 'down',
                  'bg-yellow-500': monitor.currentStatus === 'degraded',
                  'bg-gray-600': monitor.currentStatus === 'pending',
                }"
              ></div>
              <div>
                <h3 class="font-medium text-white">{{ monitor.name }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span class="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-xs text-gray-400">{{ monitor.type }}</span>
                  <span>{{ monitor.url }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right text-sm">
                <div class="text-gray-500">Last checked: {{ formatDate(monitor.lastChecked) }}</div>
                <div v-if="monitor.currentStatus !== 'pending'" class="text-gray-500">
                  Interval: {{ monitor.interval }}s
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="checkNow(monitor._id)"
                  :disabled="checkingId === monitor._id"
                  class="px-3 py-1 text-sm border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 hover:text-white disabled:opacity-50 transition-all"
                >
                  {{ checkingId === monitor._id ? 'Checking...' : 'Check Now' }}
                </button>
                <button
                  @click="deleteMonitor(monitor._id)"
                  class="px-3 py-1 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Monitor Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-slate-900 border border-white/10 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h2 class="text-lg font-medium text-white mb-4">Add Monitor</h2>
          <form @submit.prevent="saveMonitor" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="API Server" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">URL</label>
              <input v-model="form.url" required class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="https://api.example.com/health" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select v-model="form.type" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
                  <option value="http">HTTP</option>
                  <option value="tcp">TCP</option>
                  <option value="icmp">ICMP</option>
                  <option value="dns">DNS</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Method</label>
                <select v-model="form.method" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="HEAD">HEAD</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Interval (seconds)</label>
                <input v-model.number="form.interval" type="number" min="10" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Timeout (seconds)</label>
                <input v-model.number="form.timeout" type="number" min="1" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Expected Status Code</label>
              <input v-model.number="form.expectedStatus" type="number" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
