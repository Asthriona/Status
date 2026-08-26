export default defineNitroPlugin((nitroApp) => {
  const interval = setInterval(async () => {
    try {
      await runMonitorChecks()
    } catch (error) {
      console.error('[Cron] Monitor check failed:', error)
    }
  }, 60 * 1000)

  // Run immediately on startup
  runMonitorChecks().catch(console.error)

  // Cleanup on shutdown
  nitroApp.hooks.hook('close', () => {
    clearInterval(interval)
  })
})
