"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImagePlus, X } from "lucide-react";

type CreatePostFormProps = {
  userEmail: string;
  userId: string;
  onPostCreated: () => void;
};

export default function CreatePostForm({ userEmail, userId, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl = null;

      // Upload image if present
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("post-images").upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Create post
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId,
        user_email: userEmail,
        content: content.trim(),
        image_url: imageUrl,
      });

      if (insertError) throw insertError;

      // Reset form
      setContent("");
      setImage(null);
      setImagePreview(null);
      onPostCreated();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something about your products or business..."
            required
            rows={4}
            maxLength={1000}
            className="w-full px-3 py-2 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none text-primary text-base"
          />
          <div className="text-xs sm:text-sm text-primary mt-1 text-right font-semibold">{content.length}/1000</div>
        </div>

        {imagePreview && (
          <div className="relative inline-block w-full sm:w-auto">
            <img src={imagePreview} alt="Preview" className="max-h-48 w-full sm:w-auto rounded-lg border-2 border-primary object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-danger text-white p-1 rounded-full hover:bg-primary"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-secondary text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white cursor-pointer transition-colors font-bold text-sm sm:text-base">
            <ImagePlus size={20} />
            <span>Add Image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-6 py-3 bg-success text-white rounded-md hover:bg-primary border-2 border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-sm sm:text-base"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {error && <div className="text-danger text-sm font-semibold">{error}</div>}
      </form>
  );
}
