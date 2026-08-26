export default defineEventHandler(async (event) => {
  await connectMongo()

  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).lean()
  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const bcrypt = await import('bcryptjs')
  const valid = await bcrypt.default.compare(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  })

  return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } }
})
