import React from "react";

const SkeletonPostCard = () => {
  return (
    <div className="bg-gray-200 rounded-lg shadow-md p-4 mb-4 animate-pulse">
      <div className="flex items-center mb-2">
        <div className="bg-gray-300 h-8 w-8 rounded-full"></div>
        <div className="ml-2 flex-1">
          <div className="bg-gray-300 h-4 rounded w-3/4"></div>
        </div>
      </div>
      <div className="bg-gray-300 h-6 rounded w-full mb-2"></div>
      <div className="bg-gray-300 h-4 rounded w-5/6 mb-2"></div>
      <div className="bg-gray-300 h-4 rounded w-4/6 mb-2"></div>
    </div>
  );
};

export default SkeletonPostCard;
