export default defineEventHandler(async (event) => {
  requireAuth(event)
  await connectMongo()

  const method = getMethod(event)
  const config = useRuntimeConfig()
  const orgId = config.public.orgId

  if (method === 'GET') {
    await seedGroupsFromData(orgId)
    const groups = await Group.find({ orgId }).sort({ order: 1, name: 1 }).lean()
    return groups
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const groupName = await ensureGroup(orgId, body.name)

    const group = await Group.findOneAndUpdate(
      { orgId, name: groupName },
      { $set: { description: body.description, order: body.order ?? 0 } },
      { new: true, upsert: true }
    ).lean()

    return group
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { id, ...update } = body

    if (update.name) {
      update.name = update.name.trim()
      await ensureGroup(orgId, update.name)
    }

    const group = await Group.findByIdAndUpdate(id, update, { new: true }).lean()
    if (!group) {
      throw createError({ statusCode: 404, message: 'Group not found' })
    }

    return group
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const id = query.id as string

    if (!id) {
      throw createError({ statusCode: 400, message: 'Group ID is required' })
    }

    const group = await Group.findByIdAndDelete(id).lean()
    if (!group) {
      throw createError({ statusCode: 404, message: 'Group not found' })
    }

    await Promise.all([
      Component.updateMany({ orgId, group: group.name }, { $set: { group: 'General' } }),
      Monitor.updateMany({ orgId, group: group.name }, { $set: { group: 'General' } }),
    ])
    await ensureGroup(orgId, 'General')

    return { success: true }
  }
})