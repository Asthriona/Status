export default defineEventHandler(async (event) => {
  await connectMongo()

  const orgCount = await Org.countDocuments()
  if (orgCount > 0) {
    throw createError({ statusCode: 400, message: 'Setup already completed' })
  }

  const body = await readBody(event)
  const { orgName, orgSlug, email, password, name } = body

  if (!orgName || !orgSlug || !email || !password || !name) {
    throw createError({ statusCode: 400, message: 'All fields are required' })
  }

  const org = await Org.create({ name: orgName, slug: orgSlug })

  const hashedPassword = await hashPassword(password)
  await User.create({
    orgId: orgSlug,
    email,
    password: hashedPassword,
    name,
    role: 'admin',
  })

  return { success: true, orgId: orgSlug }
})
