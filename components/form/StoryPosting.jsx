import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from "react-hook-form";


const Posting = ({ story, apiEndpoint }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: story });
console.log("story",story)
 
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(story.content);
  
  const handlePublish = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("content", content);
      formData.append("visibility", data.visibility);
      formData.append("authorId", data.authorId);
       console.log(data.title,content,data.visibility,data.authorId)
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push(`/`);
      }
    } catch (error) {
      console.error("Error publishing story:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-7 pb-24"
      onSubmit={handleSubmit(handlePublish)}
    >
      <div>
        <label htmlFor="title" className="text-light-1">
          Title
        </label>
        <input
          {...register("title", { required: "Title is required" })}
          type="text"
          placeholder="Enter title"
          className="w-full input"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="content" className="text-light-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          type="text"
          rows={3}
          placeholder="What's on your mind?"
          className="w-full input"
          id="caption"
        />
      </div>

      <div>
        <label htmlFor="visibility" className="text-light-1">
          Visibility
        </label>
        <select
          {...register("visibility", { required: "Visibility is required" })}
          className="w-full input"
        >
          <option value="public">Public</option>
          <option value="followers">Followers</option>
        </select>
        {errors.visibility && (
          <p className="text-red-500">{errors.visibility.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="py-2.5 rounded-lg mt-10 bg-purple-1 text-light-1"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Publish"}
      </button>
    </form>
  );
};

export default Posting;
