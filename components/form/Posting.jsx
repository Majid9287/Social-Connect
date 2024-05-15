import { AddPhotoAlternateOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useState } from "react";

const Posting = ({ post, apiEndpoint }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: post,
  });

  const [media, setMedia] = useState(post?.postMedia?.url);
  const [mediaType, setMediaType] = useState(post?.postMedia?.type);
  const [loading, setLoading] = useState(false);
  const [mediaError, setMediaError] = useState(""); // State to track media error

  const router = useRouter();

  const sendPhoto = (result) => {
    setMedia(result?.info?.secure_url);
    setMediaType(result?.info?.resource_type);
  };

  const handlePublish = async (data) => {
    setLoading(true);
    if (!media) {
      setMediaError("Please add media before publishing.");
      setLoading(false);
      return; // Return early if media is not added
    }

    try {
      const formData = new FormData();
      formData.append("creatorId", data.creatorId);
      formData.append("caption", data.caption);
      formData.append("tag", data.tag);
      formData.append("media", media);
      formData.append("type", mediaType);
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push(`/profile/${data.creatorId}/posts`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-7 pb-24 "
      onSubmit={handleSubmit(handlePublish)}
    >
      <label
        htmlFor="media"
        className="flex gap-4 items-center text-light-1 cursor-pointer"
      >
        {media && (
          mediaType === "image" ? (
            <img
              src={media}
              alt="post"
              width={250}
              height={200}
              className="object-cover rounded-lg"
            />
          ) : (
            <video
              controls
              className="object-cover rounded-lg"
              width="250"
              height="200"
            >
              <source src={media} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
        ) }
        <CldUploadButton
            options={{ maxFiles: 1 }}
            onUpload={sendPhoto}
            onError={(error) => console.error("Upload error:", error)}
            uploadPreset="p3mzao3a"
          >
            <AddPhotoAlternateOutlined sx={{ fontSize: "100px", color: "white" }} />
          </CldUploadButton>
      </label>

      {mediaError && <p className="text-red-500">{mediaError}</p>} {/* Display media error */}

      {/* Your remaining form fields... */}

      <div>
        <label htmlFor="caption" className="text-light-1">
          Caption
        </label>
        <textarea
          {...register("caption", {
            required: "Caption is required",
            validate: (value) => {
              if (value.length < 3) {
                return "Caption must be more than 2 characters";
              }
            },
          })}
          type="text"
          rows={3}
          placeholder="What's on your mind?"
          className="w-full input"
          id="caption"
        />

        {errors.caption && (
          <p className="text-red-500">{errors.caption.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="tag" className="text-light-1">
          Tag
        </label>
        <input
          {...register("tag", { required: "Tag is required" })}
          type="text"
          placeholder="#tag"
          className="w-full input"
          id="tag"
        />

        {errors.tag && <p className="text-red-500">{errors.tag.message}</p>}
      </div>

      {loading ? (
        // Render loading icon if loading is true
        <div  className=" flex justify-center text-center y-2.5 rounded-lg mt-10 bg-purple-1  text-light-1"
        >
        <div className="py-2">loading...</div> 
        </div>
      ) : (
        <button
          type="submit"
          className="py-2.5 rounded-lg mt-10 bg-purple-1 hover:bg-gray-700 text-light-1"
        >
          Publish
        </button>
      )}
    </form>
  );
};

export default Posting;
