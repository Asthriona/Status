export default defineEventHandler(async (event) => {
  await connectMongo()

  const query = getQuery(event)
  const monitorIds = (query.ids as string || '').split(',').map((id) => id.trim()).filter(Boolean)
  const componentIds = (query.componentIds as string || '').split(',').map((id) => id.trim()).filter(Boolean)
  const days = parseInt(query.days as string) || 90

  if (monitorIds.length === 0 && componentIds.length === 0) {
    return {}
  }

  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  const results: Record<string, { date: string; uptime: number | null }[]> = {}

  if (monitorIds.length > 0) {
    const monitors = await Monitor.find({ _id: { $in: monitorIds }, orgId }).select('_id').lean()
    for (const monitor of monitors) {
      results[String(monitor._id)] = await getDailyUptimeBars(String(monitor._id), days)
    }
  }

  if (componentIds.length > 0) {
    const components = await Component.find({ _id: { $in: componentIds }, orgId }).select('_id').lean()
    for (const component of components) {
      results[String(component._id)] = await getComponentStatusDailyBars(String(component._id), days)
    }
  }

  return results
})