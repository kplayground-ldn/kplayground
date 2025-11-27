"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "Search posts..." }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-primary text-base placeholder:text-primary/50"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
            title="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
