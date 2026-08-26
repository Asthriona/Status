export default defineEventHandler(async (event) => {
  requireAuth(event)
  await connectMongo()

  const method = getMethod(event)
  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  if (method === 'GET') {
    const monitors = await Monitor.find({ orgId }).sort({ createdAt: 1 }).lean()

    const monitorsWithStatus = await Promise.all(
      monitors.map(async (monitor: any) => {
        const latest = await MonitorResult.findOne({ monitorId: monitor._id })
          .sort({ checkedAt: -1 })
          .lean()

        return {
          ...monitor,
          currentStatus: latest?.status || 'pending',
          lastChecked: latest?.checkedAt || null,
        }
      })
    )

    return monitorsWithStatus
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const monitor = await Monitor.create({
      orgId,
      name: body.name,
      url: body.url,
      type: body.type || 'http',
      method: body.method || 'GET',
      interval: body.interval || 60,
      timeout: body.timeout || 10,
      expectedStatus: body.expectedStatus,
      expectedBody: body.expectedBody,
      headers: body.headers,
      regions: body.regions || ['default'],
      active: body.active !== false,
    })

    return monitor
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { id, ...update } = body

    const monitor = await Monitor.findByIdAndUpdate(id, update, { new: true }).lean()
    if (!monitor) {
      throw createError({ statusCode: 404, message: 'Monitor not found' })
    }

    return monitor
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const id = query.id as string

    if (!id) {
      throw createError({ statusCode: 400, message: 'Monitor ID is required' })
    }

    await Monitor.findByIdAndDelete(id)
    await MonitorResult.deleteMany({ monitorId: id })
    return { success: true }
  }
})
