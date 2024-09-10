import React from "react";

const SkeletonTopBar = () => {
  return (
    <div className="flex justify-between items-center mt-6 animate-pulse">
      <div className="relative w-full max-w-md">
        <div className="bg-gray-300 h-10 w-full rounded-md"></div>
      </div>

      <div className="bg-gray-300 h-10 w-24 rounded-md"></div>

      <div className="flex gap-4 md:hidden">
        <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
        <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
      </div>
    </div>
  );
};

export default SkeletonTopBar;
