export default defineEventHandler(async (event) => {
  requireAuth(event)
  await connectMongo()

  const method = getMethod(event)
  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  if (method === 'GET') {
    const query = getQuery(event)
    const status = query.status as string

    const filter: any = { orgId }
    if (status) filter.status = status

    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('componentIds', 'name')
      .lean()

    return incidents
  }

  if (method === 'POST') {
    const body = await readBody(event)

    const incident = await Incident.create({
      orgId,
      title: body.title,
      status: body.status || 'investigating',
      impact: body.impact || 'minor',
      componentIds: body.componentIds || [],
      updates: [{
        message: body.updateMessage || 'Incident created',
        status: body.status || 'investigating',
        createdAt: new Date(),
      }],
    })

    if (body.componentIds?.length > 0) {
      const componentStatus = mapImpactToStatus(body.impact)
      for (const compId of body.componentIds) {
        await Component.findByIdAndUpdate(compId, { status: componentStatus })
        broadcastComponentUpdate(orgId, { componentId: compId, status: componentStatus })
      }
    }

    broadcastIncident(orgId, 'create', incident)
    return incident
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { id, status, message } = body

    const incident = await Incident.findById(id)
    if (!incident) {
      throw createError({ statusCode: 404, message: 'Incident not found' })
    }

    if (status) {
      incident.status = status

      if (message) {
        incident.updates.push({
          message,
          status,
          createdAt: new Date(),
        })
      }

      if (status === 'resolved') {
        incident.resolvedAt = new Date()

        for (const compId of incident.componentIds) {
          await Component.findByIdAndUpdate(compId, { status: 'operational' })
          broadcastComponentUpdate(orgId, { componentId: compId, status: 'operational' })
        }
      }

      incident.updatedAt = new Date()
      await incident.save()
    }

    broadcastIncident(orgId, 'update', incident)
    return incident
  }
})

function mapImpactToStatus(impact: string): string {
  switch (impact) {
    case 'critical': return 'major_outage'
    case 'major': return 'partial_outage'
    case 'minor': return 'degraded'
    default: return 'operational'
  }
}
