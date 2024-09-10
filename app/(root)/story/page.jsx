"use client";

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import StoryCard from "@components/cards/StoryCard1";
import { useEffect, useState } from "react";
import React from "react";
import { FilterAlt,MapsUgc, SwapVert} from "@mui/icons-material";
import { useRouter } from 'next/navigation'
import SkeletonStoryCard from "@components/skeletons/SkeletonPostCard";
import { pusherClient } from "@lib/pusher";
const Home = () => {

  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [feedstory, setFeedstory] = useState([]);
  
  const [userData, setUserData] = useState(null);
  const getUser = async () => {
    if(user){
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);}
    
  };
  const getFeedStory = async () => {
    setLoading(true);
    const response = await fetch(`/api/story?filter=popular&userId=${userData?._id}`);

    const data = await response.json();
    setFeedstory(data); // Limit to first 10 items
    setLoading(false);
  };

  useEffect(() => {
    getUser();
  }, [user]);

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
      setFeedstory(data); // Limit to first 10 items
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
   
    const channel = pusherClient.subscribe("story-updates");
    channel.bind("new-story", (newStory) => {
      getFeedStory(); 
      setFeedstory(prevStories => [newStory, ...prevStories]);
    });

    // Unsubscribe on component unmount to prevent memory leaks
    return () => {
      pusherClient.unsubscribe("story-updates");
    };
  }, []); 
  return loading ? (
    <>
    <SkeletonStoryCard />
    <SkeletonStoryCard />
    <SkeletonStoryCard />
    <SkeletonStoryCard />
    <SkeletonStoryCard />
    <SkeletonStoryCard />
  </>
  ) : (
    <div className="flex flex-col  ">
      <section className=" ">
        <div className="flex justify-between">
        <h1 className="mb-2 text-heading2-bold max-sm:text-heading3-bold text-light-1 relative">
        <SwapVert className="test-white"/>
       
        
      </h1>
      <div className="mr-4">
        <button
          className="w-12 h-12 text-5xl  "
          onClick={handleFilterClick}
        ><di className="flex rela">
          <FilterAlt className="w-12 h-16 text-white" />Filter</di>
        </button>
        {/* Dropdown menu */}
        {showDropdown && (
          <div className=" absolute z-50 py-1 w-48 bg-white rounded-md shadow-lg border">
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
        )}</div>
        </div>
   
        <div className="grid grid-cols-1 md:grid-cols-1  gap-1">
          
            {feedstory.map((story, index) => (
              <div className="p-1">
               
                <StoryCard
                  key={story._id}
                  link={story._id}
                  userImage={story.author.profilePhoto}
                  userName={story.author.username}
                  date={story.createdAt}
                  title={story.title}
                  totalContributions={story.contributions.length}
                  totalLikes={story.liked}
                  totalViews={story.totalViews}
                />
              </div>
            ))}
            
          
        </div>
      </section>
      
    </div>
  );
};

export default Home;
