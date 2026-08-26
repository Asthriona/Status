export function useStatus() {
  const statusData = useState('statusData', () => null as any)
  const loading = useState('statusLoading', () => true)
  const error = useState('statusError', () => null as string | null)

  async function fetchStatus() {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch('/api/public/status')
      statusData.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to load status'
    } finally {
      loading.value = false
    }
  }

  async function fetchMetrics(name: string, hours: number = 24) {
    try {
      return await $fetch('/api/public/metrics', {
        params: { name, hours },
      })
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
      return null
    }
  }

  return {
    statusData,
    loading,
    error,
    fetchStatus,
    fetchMetrics,
  }
}
