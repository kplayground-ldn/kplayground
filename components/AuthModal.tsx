"use client";

import { X } from "lucide-react";
import AuthForm from "./AuthForm";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-bg-secondary rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-primary bg-white rounded-t-lg">
          <h2 className="text-xl font-heading text-primary font-bold">Sign In / Sign Up</h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded transition-colors">
            <X size={24} className="text-primary" />
          </button>
        </div>

        {/* Auth Form */}
        <div className="p-4">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
