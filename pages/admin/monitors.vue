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
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
        <NuxtLink to="/admin" class="text-xl font-bold text-gray-900">Monit Admin</NuxtLink>
        <NuxtLink to="/admin" class="text-sm text-gray-600 hover:text-gray-900">Dashboard</NuxtLink>
        <NuxtLink to="/admin/components" class="text-sm text-gray-600 hover:text-gray-900">Components</NuxtLink>
        <NuxtLink to="/admin/incidents" class="text-sm text-gray-600 hover:text-gray-900">Incidents</NuxtLink>
        <NuxtLink to="/admin/monitors" class="text-sm text-blue-600 font-medium">Monitors</NuxtLink>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Monitors</h1>
        <button
          @click="showModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Monitor
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="space-y-4">
        <div v-if="monitors.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No monitors configured. Add a monitor to start checking your services.
        </div>
        <div
          v-for="monitor in monitors"
          :key="monitor._id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-green-500': monitor.currentStatus === 'up',
                  'bg-red-500': monitor.currentStatus === 'down',
                  'bg-yellow-500': monitor.currentStatus === 'degraded',
                  'bg-gray-300': monitor.currentStatus === 'pending',
                }"
              ></div>
              <div>
                <h3 class="font-medium text-gray-900">{{ monitor.name }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{{ monitor.type }}</span>
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
                  class="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {{ checkingId === monitor._id ? 'Checking...' : 'Check Now' }}
                </button>
                <button
                  @click="deleteMonitor(monitor._id)"
                  class="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
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
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Add Monitor</h2>
          <form @submit.prevent="saveMonitor" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="API Server" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input v-model="form.url" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://api.example.com/health" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="http">HTTP</option>
                  <option value="tcp">TCP</option>
                  <option value="icmp">ICMP</option>
                  <option value="dns">DNS</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select v-model="form.method" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="HEAD">HEAD</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Interval (seconds)</label>
                <input v-model.number="form.interval" type="number" min="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Timeout (seconds)</label>
                <input v-model.number="form.timeout" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expected Status Code</label>
              <input v-model.number="form.expectedStatus" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-700 hover:text-gray-900">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
