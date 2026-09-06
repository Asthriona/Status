import type { Types } from 'mongoose'

interface Transition {
  at: number
  status: string
}

export async function recordComponentStatus(
  orgId: string,
  componentId: Types.ObjectId | string,
  status: string
): Promise<void> {
  const last = await ComponentStatusEvent.findOne({ componentId })
    .sort({ changedAt: -1 })
    .lean()

  if (last && last.status === status) return

  await ComponentStatusEvent.create({
    orgId,
    componentId,
    status,
    changedAt: new Date(),
  })
}

async function getComponentTransitions(componentId: Types.ObjectId | string): Promise<Transition[]> {
  const events = await ComponentStatusEvent.find({ componentId })
    .sort({ changedAt: 1 })
    .lean()

  return events.map((e: any) => ({
    at: new Date(e.changedAt).getTime(),
    status: e.status,
  }))
}

function computeStatusUptime(
  transitions: Transition[],
  from: Date,
  to: Date
): number | null {
  if (transitions.length === 0) return null

  const start = from.getTime()
  const end = to.getTime()

  let cursor = start
  let status: string | null = null
  let idx = 0

  for (let i = 0; i < transitions.length; i++) {
    if (transitions[i].at <= start) {
      status = transitions[i].status
      idx = i + 1
    }
  }

  if (status === null) {
    let first: Transition | undefined
    for (let i = 0; i < transitions.length; i++) {
      if (transitions[i].at >= start) {
        first = transitions[i]
        idx = i + 1
        break
      }
    }

    if (!first || first.at >= end) return null

    cursor = first.at
    status = first.status
  }

  let known = 0
  let up = 0

  for (let i = idx; i < transitions.length; i++) {
    const at = transitions[i].at
    if (at >= end) break
    if (at > cursor) {
      known += at - cursor
      if (status === 'operational') up += at - cursor
    }
    cursor = at
    status = transitions[i].status
  }

  if (end > cursor) {
    known += end - cursor
    if (status === 'operational') up += end - cursor
  }

  if (known <= 0) return null

  return Math.round((up / known) * 10000) / 100
}

export async function getComponentStatusUptime(
  componentId: Types.ObjectId | string
): Promise<{ day: number | null; thirtyDays: number | null; ninetyDays: number | null }> {
  const transitions = await getComponentTransitions(componentId)
  if (transitions.length === 0) {
    return { day: null, thirtyDays: null, ninetyDays: null }
  }

  const now = new Date()
  const day = 24 * 60 * 60 * 1000
  const thirtyDays = 30 * day
  const ninetyDays = 90 * day

  return {
    day: computeStatusUptime(transitions, new Date(now.getTime() - day), now),
    thirtyDays: computeStatusUptime(transitions, new Date(now.getTime() - thirtyDays), now),
    ninetyDays: computeStatusUptime(transitions, new Date(now.getTime() - ninetyDays), now),
  }
}

export async function getComponentStatusDailyBars(
  componentId: Types.ObjectId | string,
  days: number = 90
): Promise<{ date: string; uptime: number | null }[]> {
  const transitions = await getComponentTransitions(componentId)
  const bars: { date: string; uptime: number | null }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    bars.push({
      date: dayStart.toISOString().split('T')[0],
      uptime: computeStatusUptime(transitions, dayStart, dayEnd),
    })
  }

  return bars
}