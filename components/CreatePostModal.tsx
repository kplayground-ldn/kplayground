"use client";

import { X } from "lucide-react";
import CreatePostForm from "./CreatePostForm";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  onPostCreated: () => void;
};

export default function CreatePostModal({ isOpen, onClose, userEmail, userId, onPostCreated }: CreatePostModalProps) {
  if (!isOpen) return null;

  const handlePostCreated = () => {
    onPostCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-primary bg-white rounded-t-lg">
          <h2 className="text-xl font-heading text-primary font-bold">Create New Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded transition-colors">
            <X size={24} className="text-primary" />
          </button>
        </div>

        {/* Create Post Form */}
        <div className="p-4">
          <CreatePostForm userEmail={userEmail} userId={userId} onPostCreated={handlePostCreated} />
        </div>
      </div>
    </div>
  );
}
