export default defineEventHandler(async (event) => {
  await connectMongo()

  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  const query = getQuery(event)
  const name = query.name as string
  const hours = parseInt(query.hours as string) || 24

  if (!name) {
    throw createError({ statusCode: 400, message: 'Metric name is required' })
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const metrics = await Metric.find({
    orgId,
    name,
    recordedAt: { $gte: since },
  })
    .sort({ recordedAt: 1 })
    .lean()

  return {
    name,
    unit: metrics[0]?.unit || '',
    data: metrics.map((m: any) => ({
      value: m.value,
      recordedAt: m.recordedAt,
      tags: m.tags,
    })),
  }
})
