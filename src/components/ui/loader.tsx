import React from "react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function Loader({
  className = "",
  size = "md",
  showText = true,
  text = "Loading...",
}: LoaderProps) {
  const sizeClass = sizeMap[size];

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className={`relative ${sizeClass}`}>
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-indigo-500 blur-xl animate-pulse opacity-70`}
        ></div>
        <div
          className={`absolute inset-0 rounded-full border-[3px] border-primary animate-spin`}
          style={{ animationDuration: "1.2s" }}
        ></div>
        <div className={`relative rounded-full ${sizeClass} bg-primary`}></div>
      </div>
      {showText && (
        <div className="text-primary text-lg font-semibold tracking-wide animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}
