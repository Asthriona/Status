export type ComponentStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled'

export type IncidentImpact = 'none' | 'minor' | 'major' | 'critical'

export type MonitorType = 'http' | 'tcp' | 'icmp' | 'dns'

export type MonitorStatus = 'up' | 'down' | 'degraded'

export interface PublicComponent {
  id: string
  name: string
  description?: string
  status: ComponentStatus
  group: string
  uptime: {
    day: number
    thirtyDays: number
    ninetyDays: number
  }
}

export interface PublicIncident {
  id: string
  title: string
  status: IncidentStatus
  impact: IncidentImpact
  components: { id: string; name: string }[]
  updates: {
    message: string
    status: IncidentStatus
    createdAt: string
  }[]
  createdAt: string
  resolvedAt?: string
}

export interface PublicStatus {
  overallStatus: ComponentStatus
  components: PublicComponent[]
  activeIncidents: PublicIncident[]
  monitors: {
    id: string
    name: string
    url: string
    status: MonitorStatus
    latency: number
    uptime: number
  }[]
}

export interface MetricDataPoint {
  name: string
  value: number
  unit?: string
  recordedAt: string
}
