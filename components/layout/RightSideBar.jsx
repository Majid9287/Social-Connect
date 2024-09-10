"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from 'react';

const RightSideBar = () => {
  const [loading, setLoading] = useState(true);
  const [trendingTopics, settrendingTopics] = useState([]);

  const getFeed = async () => {
    setLoading(true);
    const response = await fetch("/api/story/trending");
    const data = await response.json();
    settrendingTopics(data);
    setLoading(false);
  };

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="sticky right-0 top-0 z-20 h-screen w-[300px] xl:w-[350px] flex flex-col gap-12 overflow-auto pl-6 pr-10 py-6 max-lg:hidden">
      {loading ? (<>
        <h3 className="mb-5 text-heading2-bold max-sm:text-heading3-bold text-light-1 pt-16">Trending Topics</h3>
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-5 w-3/4"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div></>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="mb-5 text-heading2-bold max-sm:text-heading3-bold text-light-1 pt-16">Trending Topics</h3>
          <div className="flex flex-col gap-4">
            {trendingTopics.map((topic, index) => (
              <Link key={index} href="/story">
                <div className="shadow-md text-white rounded-lg p-1 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <h4 className="">{topic}</h4>
                </div>
                {index < trendingTopics.length - 1 && <hr className="border-t border-gray-200" />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSideBar;
