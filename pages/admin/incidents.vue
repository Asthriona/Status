<script setup lang="ts">
definePageMeta({ layout: false })

const token = ref('')
const incidents = ref<any[]>([])
const components = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)

const form = ref({
  title: '',
  status: 'investigating',
  impact: 'minor',
  componentIds: [] as string[],
  updateMessage: '',
})

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
    const [incidentsData, componentsData] = await Promise.all([
      $fetch('/api/admin/incidents', { headers }),
      $fetch('/api/admin/components', { headers }),
    ])
    incidents.value = incidentsData as any[]
    components.value = componentsData as any[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function createIncident() {
  try {
    await $fetch('/api/admin/incidents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: form.value,
    })
    showModal.value = false
    form.value = { title: '', status: 'investigating', impact: 'minor', componentIds: [], updateMessage: '' }
    await fetchData()
  } catch (err) {
    console.error(err)
  }
}

async function updateIncidentStatus(incidentId: string, status: string) {
  const message = prompt(`Add an update for "${status}":`)
  if (message === null) return

  try {
    await $fetch('/api/admin/incidents', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { id: incidentId, status, message },
    })
    await fetchData()
  } catch (err) {
    console.error(err)
  }
}

const statusOptions = ['investigating', 'identified', 'monitoring', 'resolved']

function formatDate(dateString: string) {
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
        <NuxtLink to="/admin/incidents" class="text-sm text-blue-600 font-medium">Incidents</NuxtLink>
        <NuxtLink to="/admin/monitors" class="text-sm text-gray-600 hover:text-gray-900">Monitors</NuxtLink>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Incidents</h1>
        <button
          @click="showModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Incident
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="space-y-4">
        <div v-if="incidents.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No incidents yet
        </div>
        <div
          v-for="incident in incidents"
          :key="incident._id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ incident.title }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-orange-100 text-orange-800': incident.status === 'investigating',
                    'bg-yellow-100 text-yellow-800': incident.status === 'identified',
                    'bg-blue-100 text-blue-800': incident.status === 'monitoring',
                    'bg-green-100 text-green-800': incident.status === 'resolved',
                    'bg-indigo-100 text-indigo-800': incident.status === 'scheduled',
                  }"
                >
                  {{ incident.status }}
                </span>
                <span class="text-sm text-gray-500">Impact: {{ incident.impact }}</span>
                <span class="text-sm text-gray-500">Created: {{ formatDate(incident.createdAt) }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-for="status in statusOptions"
                :key="status"
                @click="updateIncidentStatus(incident._id, status)"
                :disabled="incident.status === status"
                class="px-3 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                {{ status }}
              </button>
            </div>
          </div>

          <div v-if="incident.componentIds?.length" class="flex flex-wrap gap-1 mt-3">
            <span
              v-for="comp in incident.componentIds"
              :key="comp._id || comp"
              class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {{ comp.name || comp }}
            </span>
          </div>

          <div v-if="incident.updates?.length" class="mt-4 space-y-2">
            <div
              v-for="(update, idx) in incident.updates"
              :key="idx"
              class="flex gap-3 text-sm"
            >
              <span class="text-gray-500">{{ formatDate(update.createdAt) }}</span>
              <span class="font-medium text-gray-900">{{ update.status }}:</span>
              <span class="text-gray-600">{{ update.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Incident Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Create Incident</h2>
          <form @submit.prevent="createIncident" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input v-model="form.title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <select v-model="form.impact" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="none">None</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Affected Components</label>
              <div class="space-y-1">
                <label
                  v-for="comp in components"
                  :key="comp._id"
                  class="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    :value="comp._id"
                    v-model="form.componentIds"
                    class="rounded"
                  />
                  <span class="text-sm text-gray-700">{{ comp.name }}</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Initial Update</label>
              <textarea
                v-model="form.updateMessage"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
