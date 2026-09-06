export async function ensureGroup(orgId: string, name: string): Promise<string> {
  const groupName = (name && name.trim()) || 'General'

  await Group.updateOne(
    { orgId, name: groupName },
    { $setOnInsert: { orgId, name: groupName, order: 0 } },
    { upsert: true }
  )

  return groupName
}

export async function seedGroupsFromData(orgId: string): Promise<void> {
  const [componentGroups, monitorGroups] = await Promise.all([
    Component.distinct('group', { orgId, group: { $exists: true, $ne: '' } }),
    Monitor.distinct('group', { orgId, group: { $exists: true, $ne: '' } }),
  ])

  const names = [...new Set([...componentGroups, ...monitorGroups].filter(Boolean))]

  for (const name of names) {
    await Group.updateOne(
      { orgId, name },
      { $setOnInsert: { orgId, name, order: 0 } },
      { upsert: true }
    )
  }
}