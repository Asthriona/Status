<script setup lang="ts">
definePageMeta({ layout: false })

const token = ref('')
const components = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingComponent = ref<any>(null)

const form = ref({
  name: '',
  description: '',
  status: 'operational',
  group: 'General',
  order: 0,
})

onMounted(() => {
  token.value = localStorage.getItem('token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  fetchComponents()
})

async function fetchComponents() {
  try {
    components.value = await $fetch('/api/admin/components', {
      headers: { Authorization: `Bearer ${token.value}` },
    }) as any[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function openModal(component?: any) {
  if (component) {
    editingComponent.value = component
    form.value = {
      name: component.name,
      description: component.description || '',
      status: component.status,
      group: component.group,
      order: component.order,
    }
  } else {
    editingComponent.value = null
    form.value = { name: '', description: '', status: 'operational', group: 'General', order: 0 }
  }
  showModal.value = true
}

async function saveComponent() {
  try {
    const headers = { Authorization: `Bearer ${token.value}` }
    
    if (editingComponent.value) {
      await $fetch('/api/admin/components', {
        method: 'PUT',
        headers,
        body: { id: editingComponent.value._id, ...form.value },
      })
    } else {
      await $fetch('/api/admin/components', {
        method: 'POST',
        headers,
        body: form.value,
      })
    }

    showModal.value = false
    await fetchComponents()
  } catch (err) {
    console.error(err)
  }
}

async function deleteComponent(id: string) {
  if (!confirm('Are you sure you want to delete this component?')) return
  
  try {
    await $fetch('/api/admin/components', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
      params: { id },
    })
    await fetchComponents()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
        <NuxtLink to="/admin" class="text-xl font-bold text-gray-900">Monit Admin</NuxtLink>
        <NuxtLink to="/admin" class="text-sm text-gray-600 hover:text-gray-900">Dashboard</NuxtLink>
        <NuxtLink to="/admin/components" class="text-sm text-blue-600 font-medium">Components</NuxtLink>
        <NuxtLink to="/admin/incidents" class="text-sm text-gray-600 hover:text-gray-900">Incidents</NuxtLink>
        <NuxtLink to="/admin/monitors" class="text-sm text-gray-600 hover:text-gray-900">Monitors</NuxtLink>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Components</h1>
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Component
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div v-if="components.length === 0" class="p-8 text-center text-gray-500">
          No components yet. Add your first component to get started.
        </div>
        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="comp in components" :key="comp._id">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ comp.name }}</div>
                <div v-if="comp.description" class="text-sm text-gray-500">{{ comp.description }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ comp.group }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': comp.status === 'operational',
                    'bg-yellow-100 text-yellow-800': comp.status === 'degraded',
                    'bg-orange-100 text-orange-800': comp.status === 'partial_outage',
                    'bg-red-100 text-red-800': comp.status === 'major_outage',
                    'bg-indigo-100 text-indigo-800': comp.status === 'maintenance',
                  }"
                >
                  {{ comp.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ comp.order }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="openModal(comp)" class="text-blue-600 hover:text-blue-700 text-sm mr-3">Edit</button>
                <button @click="deleteComponent(comp._id)" class="text-red-600 hover:text-red-700 text-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingComponent ? 'Edit Component' : 'Add Component' }}
          </h2>
          <form @submit.prevent="saveComponent" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input v-model="form.description" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <input v-model="form.group" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="operational">Operational</option>
                <option value="degraded">Degraded</option>
                <option value="partial_outage">Partial Outage</option>
                <option value="major_outage">Major Outage</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input v-model.number="form.order" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {{ editingComponent ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
