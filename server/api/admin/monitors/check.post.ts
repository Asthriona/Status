export default defineEventHandler(async (event) => {
  requireAuth(event)
  await connectMongo()

  const body = await readBody(event)
  const { monitorId } = body

  if (!monitorId) {
    throw createError({ statusCode: 400, message: 'Monitor ID is required' })
  }

  const monitor = await Monitor.findById(monitorId).lean()
  if (!monitor) {
    throw createError({ statusCode: 404, message: 'Monitor not found' })
  }

  const result = await checkMonitor(monitor as any)

  const savedResult = await MonitorResult.create({
    monitorId: monitor._id,
    status: result.status,
    latency: result.latency,
    statusCode: result.statusCode,
    message: result.message,
    region: 'default',
    checkedAt: new Date(),
  })

  const config = useRuntimeConfig()
  broadcastMonitorCheck(config.public.orgId, {
    monitorId: monitor._id,
    status: result.status,
    latency: result.latency,
  })

  return {
    monitorId: monitor._id,
    ...result,
    checkedAt: savedResult.checkedAt,
  }
})
