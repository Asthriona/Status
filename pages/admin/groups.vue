<script setup lang="ts">
definePageMeta({ layout: false })

const token = ref('')
const groups = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingGroup = ref<any>(null)

const form = ref({
  name: '',
  description: '',
  order: 0,
})

onMounted(() => {
  token.value = localStorage.getItem('token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  fetchGroups()
})

async function fetchGroups() {
  try {
    groups.value = await $fetch('/api/admin/groups', {
      headers: { Authorization: `Bearer ${token.value}` },
    }) as any[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function openModal(group?: any) {
  if (group) {
    editingGroup.value = group
    form.value = {
      name: group.name,
      description: group.description || '',
      order: group.order || 0,
    }
  } else {
    editingGroup.value = null
    form.value = { name: '', description: '', order: 0 }
  }
  showModal.value = true
}

async function saveGroup() {
  if (!form.value.name.trim()) return

  try {
    const headers = { Authorization: `Bearer ${token.value}` }

    if (editingGroup.value) {
      await $fetch('/api/admin/groups', {
        method: 'PUT',
        headers,
        body: { id: editingGroup.value._id, ...form.value },
      })
    } else {
      await $fetch('/api/admin/groups', {
        method: 'POST',
        headers,
        body: form.value,
      })
    }

    showModal.value = false
    await fetchGroups()
  } catch (err) {
    console.error(err)
  }
}

async function deleteGroup(id: string) {
  if (!confirm('Components and monitors in this group will be moved to General. Continue?')) return

  try {
    await $fetch('/api/admin/groups', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
      params: { id },
    })
    await fetchGroups()
  } catch (err) {
    console.error(err)
  }
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
        <NuxtLink to="/admin/monitors" class="text-sm text-gray-400 hover:text-white transition-colors">Monitors</NuxtLink>
        <NuxtLink to="/admin/groups" class="text-sm text-cyan-400 font-medium">Groups</NuxtLink>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-white">Groups</h1>
        <button
          @click="openModal()"
          class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all"
        >
          Add Group
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>

      <div v-else class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5">
        <div v-if="groups.length === 0" class="p-8 text-center text-gray-500">
          No groups yet. Create your first group.
        </div>
        <table v-else class="w-full">
          <thead class="bg-white/5 border-b border-white/5">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Order</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="group in groups" :key="group._id">
              <td class="px-6 py-4">
                <div class="font-medium text-white">{{ group.name }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-400">{{ group.description || '—' }}</td>
              <td class="px-6 py-4 text-sm text-gray-400">{{ group.order }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="openModal(group)" class="text-cyan-400 hover:text-cyan-300 text-sm mr-3 transition-colors">Edit</button>
                <button @click="deleteGroup(group._id)" class="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-slate-900 border border-white/10 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h2 class="text-lg font-medium text-white mb-4">
            {{ editingGroup ? 'Edit Group' : 'Add Group' }}
          </h2>
          <form @submit.prevent="saveGroup" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input v-model="form.description" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Order</label>
              <input v-model.number="form.order" type="number" class="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all">
                {{ editingGroup ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>