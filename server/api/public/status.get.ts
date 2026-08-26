export default defineEventHandler(async (event) => {
  await connectMongo()

  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  const components = await Component.find({ orgId })
    .sort({ group: 1, order: 1 })
    .lean()

  const activeIncidents = await Incident.find({
    orgId,
    status: { $ne: 'resolved' },
  })
    .sort({ createdAt: -1 })
    .populate('componentIds', 'name')
    .lean()

  const monitors = await Monitor.find({ orgId, active: true }).lean()
  const monitorsWithStatus = await Promise.all(
    monitors.map(async (monitor: any) => {
      const latest = await MonitorResult.findOne({ monitorId: monitor._id })
        .sort({ checkedAt: -1 })
        .lean()

      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      const results = await MonitorResult.find({
        monitorId: monitor._id,
        checkedAt: { $gte: since },
      }).lean()

      const upCount = results.filter((r: any) => r.status === 'up').length
      const uptime = results.length > 0 ? Math.round((upCount / results.length) * 10000) / 100 : 100

      return {
        id: monitor._id,
        name: monitor.name,
        status: latest?.status || 'pending',
        latency: latest?.latency || 0,
        uptime,
      }
    })
  )

  const overallStatus = determineOverallStatus(components)

  return {
    overallStatus,
    components,
    activeIncidents,
    monitors: monitorsWithStatus,
  }
})

function determineOverallStatus(components: any[]): string {
  const statuses = components.map((c) => c.status)

  if (statuses.includes('major_outage')) return 'major_outage'
  if (statuses.includes('partial_outage')) return 'partial_outage'
  if (statuses.includes('degraded')) return 'degraded'
  if (statuses.includes('maintenance')) return 'maintenance'
  return 'operational'
}
