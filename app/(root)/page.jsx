"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FilterAlt, MapsUgc } from "@mui/icons-material";
import StoryCard from "@components/cards/StoryCard";
import PostCard from "@components/cards/PostCard";
import Loader from "@components/Loader";
import SkeletonStoryCard from "@components/skeletons/SkeletonStoryCard";  // Import SkeletonStoryCard
import SkeletonPostCard from "@components/skeletons/SkeletonPostCard";  // Import SkeletonPostCard

import { pusherClient } from "@lib/pusher";
import { useUser } from "@clerk/nextjs";

import Link from "next/link";

const Home = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [feedPost, setFeedPost] = useState([]);
  const [feedStory, setFeedStory] = useState([]);


  const getUser = async () => {
    if(user){
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);
  }
   
  };
  const getFeedStory = async () => {
    setLoading(true);
    const response = await fetch(`/api/story?filter=popular&userId=${userData?._id}`);

    const data = await response.json();
    setFeedStory(data?.slice(0, 10)); // Limit to first 10 items
    setLoading(false);
  };

  const getFeedPost = async () => {
    
    const response = await fetch("/api/post");
    const data = await response.json();
    setFeedPost(data);
  };
  useEffect(() => {
    getUser();
    getFeedStory();
  }, [user]);

  useEffect(() => {
    getUser();
    getFeedPost();
  }, []);
  useEffect(() => {
    if (userData) { // Check if userData is available
      getFeedStory(); // Fetch stories only when userData is available
    }
  }, [userData]);
 
  const handleFilterClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFilterOptionClick = async (option) => {
    setLoading(true);
    setShowDropdown(false);
    // Send the selected filter option to the API
    try {
      const response = await fetch(`/api/story?filter=${option}&userId=${userData?._id}`);
      const data = await response.json();
      setFeedStory(data?.slice(0, 10)); // Limit to first 10 items
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handelClick = () => {
    router.push(`/create-story`);
  };
  useEffect(() => {
    const newStoryChannel = pusherClient.subscribe("story-updates"); 
    const postChannel = pusherClient.subscribe("post-updates"); // Assuming this is your post update channel
    postChannel.bind("new-post", (newPostData) => {
      getFeedPost();
      setFeedPost((prevPosts) => [newPostData, ...prevPosts]); // Prepend the new post
    });
    
    newStoryChannel.bind("new-story", (newStoryData) => {
      getFeedStory();
      setFeedStory(prevStories => [newStoryData, ...prevStories.slice(0, 9)]); // Add new story to the beginning and limit to 10
    });

    return () => {
      // Clean up Pusher subscription on unmount
      pusherClient.unsubscribe("story-updates");
      pusherClient.unsubscribe("post-updates");
    };
  }, []); 

  
  return  (
    <div className="flex flex-col  ">
      <section className=" ">
        <div className="flex justify-between">
          <h1 className="mb-2 text-heading2-bold max-sm:text-heading3-bold text-light-1 relative">
            Stories
          </h1>
          <div className="mr-4">
            <button className="w-12 h-12 text-5xl" onClick={handleFilterClick}>
              <di className="flex rela">
                <FilterAlt className="w-12 h-16 text-white" />
                Filter
              </di>
            </button>
            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-1 md:right-auto z-50 py-1 w-48 bg-white rounded-md shadow-lg border">
                <button
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                  onClick={() => handleFilterOptionClick("popular")}
                >
                  Most Popular
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                  onClick={() => handleFilterOptionClick("followers")}
                >
                  Followers' Favorites
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                  onClick={() => handleFilterOptionClick("trending-today")}
                >
                  Trending Today
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                  onClick={() => handleFilterOptionClick("all")}
                >
                  Show All
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex gap-2 overflow-x-auto mx-auto content-noscroll"
          style={{
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "5px",
              height: "5px",
              borderRadius: "50px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: "50px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              borderRadius: "50px",
            },
          }}
        >
          <div className="flex justify-center items-center">
            <button
              onClick={handelClick}
              className=" text-black bg-white   p-6 rounded-full w-full"
            >
              <MapsUgc />
            </button>{" "}
          </div>
          <div className="flex  gap-2">
            {loading  ? (
              // Render SkeletonStoryCards while loading
              <>
                <SkeletonStoryCard />
                <SkeletonStoryCard />
                <SkeletonStoryCard />
              </>
            ) : (
              feedStory.map((story, index) => (
                <StoryCard
                  key={story?._id}
                  link={story?._id}
                  userImage={story.author?.profilePhoto}
                  userName={story?.author.username}
                  date={story?.createdAt}
                  title={story?.title}
                  totalContributions={story?.contributions.length}
                  totalLikes={story?.liked}
                  totalViews={story?.totalViews}
                />
              ))
            )}{" "}
          </div>
          {feedStory.length > 9 && (
            <div className="flex justify-center items-center ">
              <Link href="/story">
                <button className="text-black px-4 rounded-lg bg-white">
                  VIEW ALL
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
      <h1 className="mb-2 text-heading2-bold max-sm:text-heading3-bold text-light-1">
        Feed
      </h1>
      {loading ? (
        // Render SkeletonPostCards while loading
        <>
          <SkeletonPostCard />
          <SkeletonPostCard />
        </>
      ) : (
        feedPost.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            creator={post.creator}
            loggedInUser={user}
            update={getFeedPost}
          />
        ))
      )}
    </div>

  );
};

export default Home;
