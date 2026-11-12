"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number | null | undefined;
  onChange?: (rating: number | null) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };

export default function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  function handleClick(star: number) {
    if (readonly || !onChange) return;
    onChange(value === star ? null : star);
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
          className={`transition-all ${readonly ? "cursor-default" : "cursor-pointer hover:scale-125"}`}
          disabled={readonly}
        >
          <svg
            className={`${sizeMap[size]} transition-all`}
            viewBox="0 0 24 24"
            fill={star <= display ? "#FFB300" : "none"}
            stroke={star <= display ? "#FFB300" : "rgba(255,255,255,0.15)"}
            strokeWidth={1.5}
            style={star <= display ? { filter: "drop-shadow(0 0 4px rgba(255,179,0,0.5))" } : undefined}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
