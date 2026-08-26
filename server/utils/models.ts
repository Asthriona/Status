import mongoose, { Schema, type Document } from 'mongoose'

// ─── Org ───────────────────────────────────────────────────────────────────────

export interface IOrg extends Document {
  name: string
  slug: string
  logo?: string
  createdAt: Date
}

const OrgSchema = new Schema<IOrg>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export const Org = mongoose.models.Org || mongoose.model<IOrg>('Org', OrgSchema)

// ─── User ──────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  orgId: string
  email: string
  password: string
  name: string
  role: 'admin' | 'viewer'
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  orgId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

// ─── Component ─────────────────────────────────────────────────────────────────

export interface IComponent extends Document {
  orgId: string
  name: string
  description?: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
  group: string
  order: number
  createdAt: Date
}

const ComponentSchema = new Schema<IComponent>({
  orgId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'],
    default: 'operational',
  },
  group: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

ComponentSchema.index({ orgId: 1 })

export const Component = mongoose.models.Component || mongoose.model<IComponent>('Component', ComponentSchema)

// ─── Incident ──────────────────────────────────────────────────────────────────

export interface IIncidentUpdate {
  message: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled'
  createdAt: Date
}

export interface IIncident extends Document {
  orgId: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled'
  impact: 'none' | 'minor' | 'major' | 'critical'
  componentIds: mongoose.Types.ObjectId[]
  updates: IIncidentUpdate[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

const IncidentSchema = new Schema<IIncident>({
  orgId: { type: String, required: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['investigating', 'identified', 'monitoring', 'resolved', 'scheduled'],
    default: 'investigating',
  },
  impact: {
    type: String,
    enum: ['none', 'minor', 'major', 'critical'],
    default: 'minor',
  },
  componentIds: [{ type: Schema.Types.ObjectId, ref: 'Component' }],
  updates: [
    {
      message: { type: String, required: true },
      status: {
        type: String,
        enum: ['investigating', 'identified', 'monitoring', 'resolved', 'scheduled'],
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
})

IncidentSchema.index({ orgId: 1, createdAt: -1 })
IncidentSchema.index({ orgId: 1, status: 1 })

export const Incident = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema)

// ─── Monitor ───────────────────────────────────────────────────────────────────

export interface IMonitor extends Document {
  orgId: string
  name: string
  url: string
  type: 'http' | 'tcp' | 'icmp' | 'dns'
  method: string
  interval: number
  timeout: number
  expectedStatus?: number
  expectedBody?: string
  headers?: Record<string, string>
  regions: string[]
  active: boolean
  createdAt: Date
}

const MonitorSchema = new Schema<IMonitor>({
  orgId: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['http', 'tcp', 'icmp', 'dns'], default: 'http' },
  method: { type: String, default: 'GET' },
  interval: { type: Number, default: 60 },
  timeout: { type: Number, default: 10 },
  expectedStatus: { type: Number },
  expectedBody: { type: String },
  headers: { type: Schema.Types.Mixed },
  regions: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

MonitorSchema.index({ orgId: 1, active: 1 })

export const Monitor = mongoose.models.Monitor || mongoose.model<IMonitor>('Monitor', MonitorSchema)

// ─── MonitorResult ─────────────────────────────────────────────────────────────

export interface IMonitorResult extends Document {
  monitorId: mongoose.Types.ObjectId
  status: 'up' | 'down' | 'degraded'
  latency: number
  statusCode?: number
  message?: string
  region: string
  checkedAt: Date
}

const MonitorResultSchema = new Schema<IMonitorResult>({
  monitorId: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true },
  status: { type: String, enum: ['up', 'down', 'degraded'], required: true },
  latency: { type: Number, default: 0 },
  statusCode: { type: Number },
  message: { type: String },
  region: { type: String, default: 'default' },
  checkedAt: { type: Date, default: Date.now },
})

MonitorResultSchema.index({ monitorId: 1, checkedAt: -1 })
MonitorResultSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const MonitorResult = mongoose.models.MonitorResult || mongoose.model<IMonitorResult>('MonitorResult', MonitorResultSchema)

// ─── Metric ────────────────────────────────────────────────────────────────────

export interface IMetric extends Document {
  orgId: string
  componentId?: mongoose.Types.ObjectId
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  recordedAt: Date
}

const MetricSchema = new Schema<IMetric>({
  orgId: { type: String, required: true },
  componentId: { type: Schema.Types.ObjectId, ref: 'Component' },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String },
  tags: { type: Schema.Types.Mixed },
  recordedAt: { type: Date, default: Date.now },
})

MetricSchema.index({ orgId: 1, name: 1, recordedAt: -1 })
MetricSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export const Metric = mongoose.models.Metric || mongoose.model<IMetric>('Metric', MetricSchema)
