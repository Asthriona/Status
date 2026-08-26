export async function calculateUptime(monitorId: string, periodMs: number): Promise<number> {
  const since = new Date(Date.now() - periodMs)

  const results = await MonitorResult.find({
    monitorId,
    checkedAt: { $gte: since },
  }).lean()

  if (results.length === 0) return 100

  const upCount = results.filter((r: any) => r.status === 'up').length
  return Math.round((upCount / results.length) * 10000) / 100
}

export async function getComponentUptimeForPeriod(
  componentId: string,
  periodDays: number,
  monitorId?: string
): Promise<number> {
  const periodMs = periodDays * 24 * 60 * 60 * 1000
  const since = new Date(Date.now() - periodMs)

  const query: any = { checkedAt: { $gte: since } }

  if (monitorId) {
    query.monitorId = monitorId
  }

  const results = await MonitorResult.find(query).lean()

  if (results.length === 0) return 100

  const upCount = results.filter((r: any) => r.status === 'up').length
  return Math.round((upCount / results.length) * 10000) / 100
}

export async function getDailyUptimeBars(
  monitorId: string,
  days: number = 90
): Promise<{ date: string; uptime: number }[]> {
  const bars: { date: string; uptime: number }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const results = await MonitorResult.find({
      monitorId,
      checkedAt: { $gte: dayStart, $lt: dayEnd },
    }).lean()

    let uptime = 100
    if (results.length > 0) {
      const upCount = results.filter((r: any) => r.status === 'up').length
      uptime = Math.round((upCount / results.length) * 10000) / 100
    }

    bars.push({
      date: dayStart.toISOString().split('T')[0],
      uptime,
    })
  }

  return bars
}
