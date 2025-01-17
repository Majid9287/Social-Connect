"use client";

import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Loader from "@components/Loader";
import { useEffect, useState } from "react";
import React from "react";
import { pusherClient } from "@lib/pusher";
import ConfirmationModal from "@components/DeleteConfirmation";
import {
  Diversity1,
  ThumbDownAlt,
  Visibility,
  FavoriteBorder,
  ThumbUpOffAlt,
  ThumbDownOffAlt,
  MoreVert,
  Edit,
  VisibilityOff,
  ThumbUpAlt,
  Delete,
} from "@mui/icons-material";
import Link from "next/link";

const Home = () => {
  const { id } = useParams();
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [Data, setData] = useState(null);
  const [likedstory, setLikedstory] = useState(
    Data?.liked?.includes(userData?._id)
  );
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editdropdown, setEditdropdown] = useState(false);
  const [contributionID, setcontributionID] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to track if the contribution is being edited
  const [editedContent, setEditedContent] = useState("");
  const [showContributionConfirmation, setShowContributionConfirmation] =
    useState(false);
  const [contributionToDelete, setContributionToDelete] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [loading2, setloading2] = useState(false);
  const getdata = async () => {
    try {
      const response = await fetch(`/api/story/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setData(data);
      setLikedstory(data?.liked?.includes(userData?._id));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error state or display an error message
      setLoading(false);
    }
  };
  useEffect(() => {
    getdata();
  }, [id]);
  useEffect(() => {
    const likeChannel = pusherClient.subscribe(`story-${id}-liked`);
    const channel = pusherClient.subscribe(`story-${id}-contributions`);
    const contributionDeleteChannel = pusherClient.subscribe(
      `story-${id}-contribution-deleted`
    );
    const contributionUpdateChannel = pusherClient.subscribe(
      `story-${id}-contribution-update`
    );
    const contributionShowChannel = pusherClient.subscribe(
      `story-${id}-contribution-show`
    );
    const contributionHideChannel = pusherClient.subscribe(
      `story-${id}-contribution-hide`
    );
    contributionHideChannel.bind("contribution-hide", (data) => {
      getdata();
      console.log("Pusher update: contribution hidden"); // For debugging
      setData((prevData) => ({
        ...prevData,
        contributions: prevData.contributions.map((contribution) => {
          if (contribution._id === data._id) {
            return updatedContribution; // Replace with updated contribution
          }
          return contribution; // Keep others as is
        }),
      }));
    });

    contributionShowChannel.bind("contribution-show", (updatedContribution) => {
      console.log("puser show");
      getdata();
      setData((prevData) => ({
        ...prevData,
        contributions: prevData.contributions.map((contribution) => {
          if (contribution._id === updatedContribution._id) {
            return updatedContribution; // Replace with updated contribution
          }
          return contribution; // Keep others as is
        }),
      }));
    });
    contributionUpdateChannel.bind(
      "contribution-update",
      (updatedContribution) => {
        console.log("puser up");
        getdata();
        setData((prevData) => ({
          ...prevData,
          contributions: prevData.contributions.map((contribution) => {
            if (contribution._id === updatedContribution._id) {
              return updatedContribution; // Replace with updated contribution
            }
            return contribution; // Keep others as is
          }),
        }));
      }
    );

    contributionDeleteChannel.bind("contribution-deleted", (contributionId) => {
      getdata();
      setData((prevData) => ({
        ...prevData,
        contributions: prevData.contributions.filter(
          (c) => c._id !== contributionId
        ),
      }));
    });
    channel.bind("new-contribution", (populatedContribution) => {
      getdata();
      setData((prevData) => ({
        ...prevData,
        contributions: [populatedContribution, ...prevData.contributions],
      }));
    });

    channel.bind("like", (data) => {
      getdata();
      setData((prevData) => ({
        ...prevData,
        contributions: prevData.contributions.map((contribution) => {
          if (contribution._id === data.contributionId) {
            return {
              ...contribution,
              liked: data.liked, // Update the entire liked array
            };
          }
          return contribution;
        }),
      }));
    });

    // Dislike event handler
    channel.bind("dislike", (data) => {
      getdata();
      setData((prevData) => ({
        ...prevData,
        contributions: prevData.contributions.map((contribution) => {
          if (contribution._id === data.contributionId) {
            return {
              ...contribution,
              disliked: data.disliked, // Update the entire disliked array
            };
          }
          return contribution;
        }),
      }));
    });

    //like for story
    likeChannel.bind("like", ({ id, liked }) => {
      getdata();
      console.log("puser like");
      setData((prevData) => {
        // No need to check the ID since there's only one story
        return { ...prevData, liked }; // Directly update the 'liked' array in Data
      });
    });

    return () => {
      pusherClient.unsubscribe(`story-${id}-contributions`);
      pusherClient.unsubscribe(`story-${id}-liked`);
      pusherClient.unsubscribe(`story-${id}-contribution-deleted`);
      pusherClient.unsubscribe(`story-${id}-contribution-update`);
      pusherClient.unsubscribe(`story-${id}-contribution-show`);
      pusherClient.unsubscribe(`story-${id}-contribution-hide`);
    };
  }, [id]);

  const getUser = async () => {
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const editDropdown = () => {
    // Receive the index of the clicked card
    setEditdropdown(!editdropdown); // Set the dropdown state for the clicked card
  };

  const toggleDropdown = (index) => {
    // Receive the index of the clicked card
    setDropdownOpen(index); // Set the dropdown state for the clicked card
  };
  const closeDropdown = () => {
    // Receive the index of the clicked card
    setDropdownOpen(false); // Set the dropdown state for the clicked card
  };
  const handleToggleInput = () => {
    setShowInput(!showInput);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    setLoading1(true);
    try {
      const formData = new FormData();
      formData.append("content", inputValue);
      formData.append("authorId", userData._id);
      console.log(formData);
      const response = await fetch(`/api/story/${id}/contribute`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setInputValue("");
        setShowInput(false);
          getdata();
      } else {
        console.error("Failed to submit contribution");
      }
    } catch (error) {
      console.error("Error submitting contribution:", error);
    } finally {
      setLoading1(false);
    }
  };

  const handleToggleContributionConfirmation = (contributionId) => {
    setShowContributionConfirmation(true);
    setContributionToDelete(contributionId);
  };

  const handleCancelContributionDelete = () => {
    setShowContributionConfirmation(false);
    setContributionToDelete(null);
  };

  const handleConfirmContributionDelete = async () => {
    setDelLoading(true);
    try {
      const response = await fetch(
        `/api/story/${id}/${contributionToDelete}/contriDelete`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setShowContributionConfirmation(false);
        setContributionToDelete(null);
        setDelLoading(false);
        // getdata();
      } else {
        console.error("Failed to delete con");
      }
    } catch (error) {
      console.error("Error deleting con:", error);
    } finally {
      setShowContributionConfirmation(false);
      setContributionToDelete(null);
      setDelLoading(false);
    }
  };

  const handleEdit = (contributionId, content) => {
    setIsEditing(true); // Open the edit pop-up
    setEditedContent(content); // Set the edited content
    setcontributionID(contributionId);
  };

  const handleSaveEdit = async () => {
    setloading2(true);
    try {
      const formData = new FormData();
      formData.append("content", editedContent);
      console.log(editedContent);
      const response = await fetch(
        `/api/story/${id}/${contributionID}/contriUpdate`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        setloading2(false);
        setIsEditing(false); // Close the edit pop-up
        // getdata(); // Refresh data after edit operation
      } else {
        console.error("Failed to save edited contribution");
      }
    } catch (error) {
      console.error("Error saving edited contribution:", error);
    } finally {
      setloading2(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Close the edit pop-up
    setEditedContent(""); // Clear the edited content
  };
  const handleHide = async (contributionId) => {
    setDelLoading(true);
    try {
      const response = await fetch(
        `/api/story/${id}/${contributionId}/contriHide`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        setDelLoading(false);
      } else {
        console.error("Failed to hide contribution");
      }
    } catch (error) {
      console.error("Error hiding contribution:", error);
    } finally {
      setDelLoading(false);
    }
  };

  const handleShow = async (contributionId) => {
    setDelLoading(true);
    try {
      const response = await fetch(
        `/api/story/${id}/${contributionId}/contriShow`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        setDelLoading(false);
      } else {
        console.error("Failed to show contribution");
      }
    } catch (error) {
      console.error("Error showing contribution:", error);
    } finally {
      setDelLoading(false);
    }
  };
  const handlelike = async (contributionId) => {
    const userId = userData._id;
    const contribution = Data?.contributions.find((contribution) => contribution._id === contributionId);
    const alreadyLiked = contribution?.liked?.includes(userId);
    const newLiked = alreadyLiked ? contribution.liked.filter((id) => id !== userId) : [...contribution.liked, userId];

    // Update the UI immediately
    setData((prevData) => ({
      ...prevData,
      contributions: prevData.contributions.map((contribution) =>
        contribution._id === contributionId
          ? {
              ...contribution,
              liked: newLiked,
            }
          : contribution
      ),
    }));
    try {
      const formData = new FormData();
      formData.append("userId", userData._id);
      const response = await fetch(
        `/api/story/${id}/${contributionId}/contriLike`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        // Handle success
        // getdata(); // Refresh data after show operation
      } else {
        console.error("Failed to show contribution");
      }
    } catch (error) {
      console.error("Error showing contribution:", error);
    }
  };
  const handledislike = async (contributionId) => {
    const userId = userData._id;
    const contribution = Data?.contributions.find((contribution) => contribution._id === contributionId);
    const alreadyDisliked = contribution?.disliked?.includes(userId);
    const newDisliked = alreadyDisliked ? contribution.disliked.filter((id) => id !== userId) : [...contribution.disliked, userId];

    // Update the UI immediately
    setData((prevData) => ({
      ...prevData,
      contributions: prevData.contributions.map((contribution) =>
        contribution._id === contributionId
          ? {
              ...contribution,
              disliked: newDisliked,
            }
          : contribution
      ),
    }));
    try {
      const formData = new FormData();
      formData.append("userId", userData._id);
      const response = await fetch(
        `/api/story/${id}/${contributionId}/contriDislike`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        // Handle success
        // getdata(); // Refresh data after show operation
      } else {
        console.error("Failed to show contribution");
      }
    } catch (error) {
      console.error("Error showing contribution:", error);
    }
  };
  const handleLikeClick = async (Id) => {
    const userId = userData._id;
    const alreadyLiked = Data?.liked?.includes(userId);
    const newLiked = alreadyLiked ? Data.liked.filter((id) => id !== userId) : [...Data.liked, userId];

    // Update the UI immediately
    setData((prevData) => ({
      ...prevData,
      liked: newLiked,
    }));
    try {
      const res = await fetch(`/api/story/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData._id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (likedstory) {
          setLikedstory(false);
        } else {
          setLikedstory(true);
        }
      } else {
        console.error("Failed to like comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    setDelLoading(true);
    try {
      const response = await fetch(`/api/story/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setShowConfirmation(false);
        setDelLoading(false);
        router.back();
      } else {
        console.error("Failed to delete story");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    } finally {
      setDelLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col w-full ">
      {Data && (
        <section>
          <div className="bg-gray-100  text-black min-h-screen w-full rounded-md">
            <div className="mx-auto">
              <section>
                <div className="pt-12">
                  <div className="mx-auto flex">
                    <div className=" w-2/6 md:w-1/4 pb-4 px-2">
                      <div className="text-black ">
                        <div className="flex truncate">
                          {" "}
                          <img
                            className="md:h-8 md:w-8 h-6 w-6 rounded-full"
                            src={Data.author.profilePhoto}
                            alt=""
                          />
                          <div className="overflow-hidden">
                            <p className="pl-2 pt-1 md:text-sm font-semibold truncate">
                              {Data.author.username}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="md:text-xs text-gray-500 truncate">
                            {formatDate(Data.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 md:gap-2 pt-2 ">
                        <div className=" items-center">
                          <Diversity1 className="text-green-500" />
                          <p className="text-xs text-gray-500">
                            {Data.contributions.length}
                          </p>{" "}
                        </div>
                        <div className=" items-center">
                          <button
                            className="mr-1 focus:outline-none"
                            onClick={() => handleLikeClick(Data._id)}
                          >
                             {Data.liked.includes(userData._id)  ? (
                              <ThumbUpAlt className="text-red-500" />
                            ) : (
                              <ThumbUpOffAlt className="text-red-500" />
                            )}
                          </button>
                          <p className="text-xs text-gray-500">
                            {Data.liked.length}
                          </p>
                        </div>
                        <div className="items-center">
                          <Visibility className="text-blue-500" />
                          <p className="text-xs text-gray-500">
                            {Data.totalViews}
                          </p>
                        </div>
                        {userData._id == Data.author._id && (
                          <div className=" items-center">
                            <MoreVert
                              className="text-black cursor-pointer"
                              onClick={editDropdown} // Pass the index to toggleDropdown function
                            />
                            <>
                              {editdropdown && (
                                <div className="absolute z-50  bg-white rounded-md shadow-lg">
                                  <ul className="py-1">
                                    {userData._id == Data.author._id && (
                                      <li>
                                        <Link href={`/edit-story/${Data._id}`}>
                                          {" "}
                                          <button className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left">
                                            <Edit className="mr-2 text-blue-500" />{" "}
                                            Edit
                                          </button>
                                        </Link>
                                      </li>
                                    )}

                                    {userData._id == Data.author._id && (
                                      <li>
                                        <button
                                          onClick={() =>
                                            setShowConfirmation(true)
                                          }
                                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                                        >
                                          <Delete className="mr-2 text-red-500" />{" "}
                                          Delete
                                        </button>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-4/6 md:w-3/4 border-l-2 p-1">
                      <h2 className="text-lg text-black font-bold mb-2">
                        {Data.title}
                      </h2>
                      <p>{Data.content}</p>
                    </div>
                  </div>
                </div>
              </section>
              {Data.contributions.map((story, index) => (
                <section className=" border-t-2">
                  <div className="">
                    <div className="mx-auto flex">
                      <div className=" w-2/6 md:w-1/4 pb-4 px-2 pt-2">
                        <div className="text-black ">
                          <div className="flex ">
                            {" "}
                            <img
                              className="md:h-8 md:w-8 h-6 w-6 rounded-full"
                              src={story.author.profilePhoto}
                              alt=""
                            />
                            <div className="overflow-hidden">
                              <p className="pl-2 pt-1 md:text-sm truncate font-semibold">
                                {story.author.username}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="md:text-xs text-gray-500 truncate">
                              {formatDate(story.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 ">
                          <div className=" items-center">
                            {story.liked.includes(userData._id) ? (
                              <ThumbUpAlt
                                className="text-blue-500"
                                onClick={() => handlelike(story._id)}
                              />
                            ) : (
                              <ThumbUpOffAlt
                                className="text-blue-500"
                                onClick={() => handlelike(story._id)}
                              />
                            )}
                            <p className="text-xs text-black">
                              {story.liked.length}
                            </p>{" "}
                          </div>
                          <div className=" items-center">
                            {story.disliked.includes(userData._id) ? (
                              <ThumbDownAlt
                                className="text-blue-500"
                                onClick={() => handledislike(story._id)}
                              />
                            ) : (
                              <ThumbDownOffAlt
                                className="text-blue-500"
                                onClick={() => handledislike(story._id)}
                              />
                            )}
                            <p className="text-xs text-gray-500">
                              {story.disliked?.length}
                            </p>
                          </div>
                          {userData._id == story.author._id && (
                            <div className=" items-center">
                              <MoreVert
                                className="text-black cursor-pointer"
                                onMouseEnter={() => toggleDropdown(index)} // Pass the index to toggleDropdown function
                              />
                              <>
                                {dropdownOpen === index && (
                                  <div
                                    onMouseLeave={closeDropdown}
                                    className="absolute z-50  bg-white rounded-md shadow-lg"
                                  >
                                    <ul className="py-1">
                                      {userData._id == story.author._id && (
                                        <li>
                                          <button
                                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                                            onClick={() =>
                                              handleEdit(
                                                story._id,
                                                story.content
                                              )
                                            }
                                          >
                                            <Edit className="mr-2" /> Edit
                                          </button>
                                        </li>
                                      )}
                                      {userData._id == Data.author._id &&
                                        story.status == "show" && (
                                          <li>
                                            <button
                                              onClick={() =>
                                                handleHide(story._id)
                                              }
                                              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                                            >
                                              <VisibilityOff className="mr-2" />{" "}
                                              {delLoading
                                                ? "hiding..."
                                                : "Hide"}
                                            </button>
                                          </li>
                                        )}
                                      {userData._id == Data.author._id &&
                                        story.status == "hidden" && (
                                          <li>
                                            <button
                                              onClick={() =>
                                                handleShow(story._id)
                                              }
                                              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                                            >
                                              <Visibility className="mr-2" />{" "}
                                              {delLoading
                                                ? "showing..."
                                                : "show"}
                                            </button>
                                          </li>
                                        )}
                                      {userData._id == story.author._id && (
                                        <li>
                                          <button
                                            onClick={() =>
                                              handleToggleContributionConfirmation(
                                                story._id
                                              )
                                            }
                                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
                                          >
                                            <Delete className="mr-2 text-red-500" />{" "}
                                            Delete
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </>
                            </div>
                          )}
                        </div>
                      </div>
                      {story.status === "show" ? (
                        <div className="w-4/6 md:w-3/4 border-l-2 p-1 pt-2">
                          <p>{story.content}</p>
                        </div>
                      ) : (
                        <div className="w-4/6 md:w-3/4 border-l-2 p-1 pt-2">
                          <p className="text-red-500">
                            Content is hidden by story author
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              ))}
              <section>
                <div className="mx-auto px-4 py-6">
                  <h2 className="text-lg font-bold mb-4">For Contributions:</h2>

                  <div className="mt-4">
                    {showInput ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-500 mr-2"
                          placeholder="Add your thoughts..."
                          value={inputValue}
                          required
                          onChange={handleInputChange}
                        />
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                          onClick={handleSubmitContribution}
                        >
                          {loading1 ? "loading..." : "Submit"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleToggleInput}
                      >
                        Contribute
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
          {isEditing && (
            <div className="text-black fixed top-0 z-50 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-4 rounded-lg">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                ></textarea>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleSaveEdit}
                  >
                    {loading2 ? "saving.." : "Save"}
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}{" "}
      {showConfirmation && (
        <ConfirmationModal
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={delLoading}
          text="Are you sure you want to delete this Story?"
        />
      )}
      {showContributionConfirmation && (
        <ConfirmationModal
          onCancel={handleCancelContributionDelete}
          onConfirm={handleConfirmContributionDelete}
          loading={delLoading}
          text="Are you sure you want to delete this contribution?"
        />
      )}
    </div>
  );
};

export default Home;
