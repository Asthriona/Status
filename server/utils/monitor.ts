export async function checkMonitor(monitor: any): Promise<{
  status: 'up' | 'down' | 'degraded'
  latency: number
  statusCode?: number
  message?: string
}> {
  const start = Date.now()

  try {
    if (monitor.type === 'http') {
      return await checkHttp(monitor, start)
    }
    if (monitor.type === 'tcp') {
      return await checkTcp(monitor, start)
    }
    return { status: 'down', latency: 0, message: `Check type ${monitor.type} not implemented` }
  } catch (error: any) {
    console.error(`[Monitor] ${monitor.name} error:`, error.message)
    return {
      status: 'down',
      latency: Date.now() - start,
      message: error.message || 'Unknown error',
    }
  }
}

async function httpGet(url: string, options: { timeout: number; method: string; headers?: Record<string, string> }): Promise<{ statusCode: number; body: string }> {
  const parsed = new URL(url)
  const isHttps = parsed.protocol === 'https:'

  const mod = isHttps ? await import('node:https') : await import('node:http')

  return new Promise((resolve, reject) => {
    const req = mod.request(
      url,
      {
        method: options.method,
        headers: options.headers || {},
        rejectUnauthorized: false,
        timeout: options.timeout * 1000,
      },
      (res: any) => {
        let body = ''
        res.on('data', (chunk: any) => (body += chunk))
        res.on('end', () => resolve({ statusCode: res.statusCode, body }))
      }
    )

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout'))
    })

    req.end()
  })
}

async function checkHttp(
  monitor: any,
  start: number
): Promise<{ status: 'up' | 'down' | 'degraded'; latency: number; statusCode?: number; message?: string }> {
  try {
    const result = await httpGet(monitor.url, {
      timeout: monitor.timeout || 10,
      method: monitor.method || 'GET',
      headers: monitor.headers,
    })

    const latency = Date.now() - start

    let status: 'up' | 'down' | 'degraded' = 'up'

    if (monitor.expectedStatus && result.statusCode !== monitor.expectedStatus) {
      status = 'down'
    } else if (result.statusCode >= 500) {
      status = 'down'
    } else if (result.statusCode >= 400) {
      status = 'degraded'
    }

    if (status === 'up' && monitor.expectedBody) {
      if (!result.body.includes(monitor.expectedBody)) {
        status = 'down'
      }
    }

    if (status === 'up' && latency > 3000) {
      status = 'degraded'
    }

    return {
      status,
      latency,
      statusCode: result.statusCode,
    }
  } catch (error: any) {
    const latency = Date.now() - start
    console.error(`[Monitor] HTTP check failed for ${monitor.url}:`, error.message)
    return {
      status: 'down',
      latency,
      message: error.message,
    }
  }
}

async function checkTcp(
  monitor: any,
  start: number
): Promise<{ status: 'up' | 'down' | 'degraded'; latency: number; message?: string }> {
  try {
    const url = new URL(monitor.url)
    const host = url.hostname
    const port = parseInt(url.port || '80')

    const net = await import('node:net')
    const socket = net.createConnection({ host, port, timeout: monitor.timeout * 1000 })

    return new Promise((resolve) => {
      socket.on('connect', () => {
        const latency = Date.now() - start
        socket.destroy()
        resolve({ status: 'up', latency })
      })

      socket.on('timeout', () => {
        socket.destroy()
        resolve({ status: 'down', latency: Date.now() - start, message: 'Timeout' })
      })

      socket.on('error', (err: any) => {
        socket.destroy()
        resolve({ status: 'down', latency: Date.now() - start, message: err.message })
      })
    })
  } catch (error: any) {
    return { status: 'down', latency: Date.now() - start, message: error.message }
  }
}

export async function runMonitorChecks(): Promise<void> {
  const monitors = await Monitor.find({ active: true }).lean()

  for (const monitor of monitors) {
    const result = await checkMonitor(monitor as any)

    await MonitorResult.create({
      monitorId: monitor._id,
      status: result.status,
      latency: result.latency,
      statusCode: result.statusCode,
      message: result.message,
      region: 'default',
      checkedAt: new Date(),
    })
  }
}
