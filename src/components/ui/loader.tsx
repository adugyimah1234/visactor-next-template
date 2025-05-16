import React from "react";

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Loader({ className = "", size = 'md', showText = true }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className={`relative flex ${sizeClasses[size]}`}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className={`relative inline-flex rounded-full ${sizeClasses[size]} bg-primary`}></span>
      </span>
      {showText && <span className="ml-4 text-primary font-medium text-lg">Loading...</span>}
    </div>
  );
}