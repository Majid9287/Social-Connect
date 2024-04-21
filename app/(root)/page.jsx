"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from "react";
import { FilterAlt, MapsUgc } from "@mui/icons-material";
import StoryCard from "@components/cards/StoryCard";
import PostCard from "@components/cards/PostCard";
import Loader from "@components/Loader";

import { useUser } from "@clerk/nextjs";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';

const Home = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [feedPost, setFeedPost] = useState([]);
  const [feedStory, setFeedStory] = useState([]);

  const getFeedStory = async () => {
    setLoading(true);
    const response = await fetch("/api/story?filter=all");
    const data = await response.json();
    setFeedStory(data.slice(0, 10)); // Limit to first 10 items
    setLoading(false);
  };

  const getFeedPost = async () => {
    setLoading(true);
    const response = await fetch("/api/post");
    const data = await response.json();
    setFeedPost(data);
    setLoading(false);
  };

  useEffect(() => {
    getFeedStory();
    getFeedPost();
  }, []);

  const slickSettings = {
    useCSS: true,
    prevArrow: null,
    infinite: false,
    nextArrow: null,
    arrows: false,
    variableWidth: true,
    slidesToShow: 1.5,
    slidesToScroll: 1,
  };

  const handleFilterClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFilterOptionClick = async (option) => {
    setLoading(true);
    // Send the selected filter option to the API
    try {
      const response = await fetch(`/api/story?filter=${option}`);
      const data = await response.json();
      setFeedStory(data.slice(0, 10)); // Limit to first 10 items
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handelClick = () => {
    router.push(`/create-story`);
  };

  return isLoaded ? (
    <div className="flex flex-col  ">
      <section className=" ">
        <div className="flex justify-between">
          <h1 className="mb-2 text-heading2-bold max-sm:text-heading3-bold text-light-1 relative">
            Stories
          </h1>
          <div className="mr-4">
            <button
              className="w-12 h-12 text-5xl"
              onClick={handleFilterClick}
            >
              <di className="flex rela">
                <FilterAlt className="w-12 h-16 text-white" />
                Filter
              </di>
            </button>
            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute z-50 py-1 w-48 bg-white rounded-md shadow-lg border">
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

        <div className="">
          <Slider {...slickSettings} className="">
            <div className="">
              <button
                onClick={handelClick}
                className=" text-black bg-white  py-14 px-2 my-1 rounded-lg w-full"
              >
                <MapsUgc /> New story
              </button>{" "}
            </div>
            {feedStory.map((story, index) => (
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
            {feedStory.length > 9 && (
              <div className="flex justify-center items-center my-12">
                <Link href="/story">
                  <button className="text-black px-2 rounded-lg bg-white">
                    VIEW ALL
                  </button>
                </Link>
              </div>
            )}
          </Slider>
        </div>
      </section>
      <h1 className="mb-2 text-heading2-bold max-sm:text-heading3-bold text-light-1">
        Feed
      </h1>
      {feedPost.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          creator={post.creator}
          loggedInUser={user}
          update={getFeedPost}
        />
      ))}
    </div>
  ) : (
    <Loader />
  );
};

export default Home;

