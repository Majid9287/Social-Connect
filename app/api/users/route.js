import User from "@lib/models/User"
import { connectToDB } from "@lib/mongodb/mongoose"

export const GET = async (req, res) => {
  try {
    await connectToDB()

    const allUsers = await User.find()

    return new Response(JSON.stringify(allUsers), { status: 200 })
  } catch (err) {
    console.log(err)
    return new Response("Failed to get all users", { status: 500 })
  }
}