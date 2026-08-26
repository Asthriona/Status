import mongoose from 'mongoose'

let isConnected = false

export async function connectMongo(): Promise<typeof mongoose> {
  if (isConnected) return mongoose

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  await mongoose.connect(uri)
  isConnected = true
  console.log('[MongoDB] Connected to', uri)
  return mongoose
}

export function useMongo(): typeof mongoose {
  if (!isConnected) {
    connectMongo().catch(console.error)
  }
  return mongoose
}
