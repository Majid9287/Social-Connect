"use client";

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import StoryCard from "@components/cards/StoryCard1";
import { useEffect, useState } from "react";
import React from "react";
import { FilterAlt,MapsUgc } from "@mui/icons-material";
import { useRouter } from 'next/navigation'
const Home = () => {

  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [feedstory, setFeedstory] = useState([]);
  const getFeedStory = async () => {
    const response = await fetch("/api/story");
    const data = await response.json();
    
    setFeedstory(data);
    setLoading(false);
  };
 

  useEffect(() => {
    getFeedStory();
  }, []);

  

  const handleFilterClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFilterOptionClick = (option) => {
    // Handle filter option click here
    console.log("Selected filter option:", option);
  };
  
  return loading || !isLoaded ? (
    <Loader />
  ) : (
    <div className="flex flex-col  ">
      <section className=" ">
        <div className="flex justify-between">
        <h1 className="mb-2 text-heading2-bold max-sm:text-heading3-bold text-light-1 relative">
        Stories
       
        
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
          <div className=" absolute z-50 right-1 md:right-auto py-1 w-48 bg-white rounded-md shadow-lg border">
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
