import Story from "@lib/models/Story";
import Contribution from "@lib/models/Contribution";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

// GET: Fetch stories with filtering
export const GET = async (req) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url)
    const filter= searchParams.get('filter')
    const userId= searchParams.get('userId')
    
    let query = {}; // Base query
    let sortOptions = {};

    switch (filter) {
      case "popular":
        sortOptions = { liked: -1 }; // Sort by likes (descending)
        break;

      case "followers":
        if (!userId) {
          return new Response("User ID is required for followers filter", {
            status: 400,
          });
        }

        const user = await User.findById(userId).select("following");
        if (!user) {
          return new Response("User not found", { status: 404 });
        }
        const followingIds = user.following.map((user) => user._id);
        query.author = { $in: followingIds };
        break;

      case "trending-today":
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

        query.createdAt = { $gte: today, $lt: tomorrow };
        sortOptions = { totalViews: -1 };
        break;

      // Default case: no filter or "all"
      default:
        if (!userId) { // If not logged in, only show public stories
          query.visibility = "public"; 
        } else {
          // If logged in, fetch both public stories and those followed by the user
          const user = await User.findById(userId).select("following"); 
          if (!user) {
            return new Response("User not found", { status: 404 });
          }
          const followingIds = user.following.map(user => user._id);
      
          query = {
            $or: [
              { visibility: "public" }, // Include public stories
              { visibility: "followers", author: { $in: followingIds } } // Include followed stories
            ]
          };
        }
        break;
    }

    const stories = await Story.find(query)
      .sort(sortOptions)
      .select('-__v -updatedAt') // Exclude unnecessary fields
      .populate({
        path: 'author',
        model: User,
        select: '_id username profilePhoto', // Select only needed author fields
      })
      .populate({
        path: 'contributions',
        model: Contribution,
        select: '-__v -updatedAt', // Exclude unnecessary contribution fields
        populate: {
          path: 'author',
          model: User,
          select: '_id username profilePhoto', // Select only needed author fields
        },
      })
      .lean()  // Return plain JavaScript object
      .exec();

    return new Response(JSON.stringify(stories), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch stories" }), { status: 500 });

  }
};


