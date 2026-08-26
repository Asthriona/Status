<script setup lang="ts">
definePageMeta({ layout: false })

const form = ref({
  orgName: '',
  orgSlug: '',
  email: '',
  password: '',
  name: '',
})
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSetup() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/setup', {
      method: 'POST',
      body: form.value,
    })
    success.value = true
    setTimeout(() => navigateTo('/admin/login'), 2000)
  } catch (err: any) {
    error.value = err.data?.message || 'Setup failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 class="text-2xl font-bold text-gray-900 text-center mb-2">Welcome to Monit</h1>
        <p class="text-gray-500 text-center mb-6">Set up your status page</p>

        <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p class="text-green-800">Setup complete! Redirecting to login...</p>
        </div>

        <form v-else @submit.prevent="handleSetup" class="space-y-4">
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{{ error }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input
              v-model="form.orgName"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="My Company"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Slug</label>
            <input
              v-model="form.orgSlug"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="my-company"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              v-model="form.name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Setting up...' : 'Complete Setup' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
