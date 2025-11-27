"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImagePlus, X } from "lucide-react";

type CreatePostFormProps = {
  userEmail: string;
  username: string;
  userId: string;
  onPostCreated: () => void;
};

export default function CreatePostForm({ userEmail, username, userId, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxImages = 5;

    // Check if adding these images would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate each file
    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        return;
      }
    }

    // Add new images to existing ones
    const newImages = [...images, ...fileArray];
    const newPreviews = [...imagePreviews, ...fileArray.map(file => URL.createObjectURL(file))];

    setImages(newImages);
    setImagePreviews(newPreviews);
    setError("");

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const imageUrls: string[] = [];

      // Upload all images if present
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const fileExt = image.name.split(".").pop();
          const fileName = `${userId}-${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage.from("post-images").upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(fileName);
          imageUrls.push(urlData.publicUrl);
        }
      }

      // Create post with multiple images
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId,
        user_email: userEmail,
        username: username,
        content: content.trim(),
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,  // Keep first image for backward compatibility
        image_urls: imageUrls,
      });

      if (insertError) throw insertError;

      // Clean up preview URLs
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));

      // Reset form
      setContent("");
      setImages([]);
      setImagePreviews([]);
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

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 sm:h-40 rounded-lg border-2 border-primary object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-danger text-white p-1 rounded-full hover:bg-primary shadow-lg"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-secondary text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white cursor-pointer transition-colors font-bold text-sm sm:text-base">
            <ImagePlus size={20} />
            <span>Add Images ({images.length}/5)</span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
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
