export default defineEventHandler(async (event) => {
  await connectMongo()

  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  const apiKey = getHeader(event, 'x-api-key')
  if (!apiKey || apiKey !== config.jwtSecret) {
    throw createError({ statusCode: 401, message: 'Invalid API key' })
  }

  const body = await readBody(event)
  const { name, value, unit, componentId, tags } = body

  if (!name || value === undefined) {
    throw createError({ statusCode: 400, message: 'Name and value are required' })
  }

  const metric = await Metric.create({
    orgId,
    componentId: componentId || undefined,
    name,
    value,
    unit,
    tags,
    recordedAt: new Date(),
  })

  broadcastMetric(orgId, {
    componentId,
    name,
    value,
    unit,
    recordedAt: metric.recordedAt,
  })

  return { success: true, id: metric._id }
})
