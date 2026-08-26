export default defineEventHandler(async (event) => {
  requireAuth(event)
  await connectMongo()

  const method = getMethod(event)
  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  if (method === 'GET') {
    const components = await Component.find({ orgId }).sort({ group: 1, order: 1 }).lean()
    return components
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const component = await Component.create({
      orgId,
      name: body.name,
      description: body.description,
      status: body.status || 'operational',
      group: body.group || 'General',
      order: body.order || 0,
    })

    broadcastComponentUpdate(orgId, { componentId: component._id, status: component.status })
    return component
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { id, ...update } = body

    const component = await Component.findByIdAndUpdate(id, update, { new: true }).lean()
    if (!component) {
      throw createError({ statusCode: 404, message: 'Component not found' })
    }

    broadcastComponentUpdate(orgId, { componentId: component._id, status: component.status })
    return component
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const id = query.id as string

    if (!id) {
      throw createError({ statusCode: 400, message: 'Component ID is required' })
    }

    await Component.findByIdAndDelete(id)
    return { success: true }
  }
})
