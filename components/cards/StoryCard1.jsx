import { Diversity1, Visibility, FavoriteBorder } from "@mui/icons-material";
import { useRouter } from 'next/navigation'

const StoryCard = ({
  link,
  userImage,
  userName,
  date,
  title,
  totalContributions,
  totalLikes,
  totalViews,
}) => {
  const router = useRouter();

  const formattedDate = new Date(date).toISOString().split("T")[0]; // Extracting only the date portion

  const handleClick = () => {
    router.push(`/story/${link}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 " onClick={handleClick}>
      <div className="flex text-black items-center mb-2 justify-between">
        <div className="flex justify-center text-center">
          {" "}
          <img
            className="md:h-8 md:w-8 h-6 w-6 rounded-full"
            src={userImage}
            alt=""
          />
          <div>
            <p className=" pl-2 pt-1 md:text-sm truncate font-semibold">
              {userName}
            </p>
          </div>
        </div>
        <div>
          <p className="md:text-xs ml-2 text-gray-500 truncate">{formattedDate}</p> {/* Use the formatted date */}
        </div>
      </div>
      <h2 className="text-lg text-black font-semibold mb-2 truncate">
        {title}
      </h2>
      <div className="flex  mb-2">
        <div className="flex   space-x-5">
          <div className="flex  gap-1 items-center">
            <Diversity1 className="text-green-500" />
            <p className="text-xs text-gray-500">{totalContributions}</p>{" "}
          </div>
          <div className="flex gap-1 items-center">
            <FavoriteBorder className="text-red-500" />
            <p className="text-xs text-gray-500">{totalLikes}</p>
          </div>
          <div className="flex gap-1 items-center">
            <Visibility className="text-blue-500" />
            <p className="text-xs text-gray-500">{totalViews}</p>
          </div>
        </div>
        {/* Add any additional actions or buttons here */}
      </div>
    </div>
  );
};

export default StoryCard;
