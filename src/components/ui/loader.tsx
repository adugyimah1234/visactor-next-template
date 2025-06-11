import React from "react";

interface LoaderProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  text?: string;
  variant?: "spinner" | "dots" | "pulse" | "bars";
  color?: "indigo" | "blue" | "green" | "red" | "purple" | "gray";
}

const sizeMap = {
  xs: "h-4 w-4",
  sm: "h-6 w-6", 
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl",
};

const colorMap = {
  indigo: {
    primary: "border-indigo-600",
    secondary: "border-indigo-200",
    bg: "bg-indigo-600",
    text: "text-indigo-600",
  },
  blue: {
    primary: "border-blue-600",
    secondary: "border-blue-200", 
    bg: "bg-blue-600",
    text: "text-blue-600",
  },
  green: {
    primary: "border-green-600",
    secondary: "border-green-200",
    bg: "bg-green-600", 
    text: "text-green-600",
  },
  red: {
    primary: "border-red-600",
    secondary: "border-red-200",
    bg: "bg-red-600",
    text: "text-red-600",
  },
  purple: {
    primary: "border-purple-600", 
    secondary: "border-purple-200",
    bg: "bg-purple-600",
    text: "text-purple-600",
  },
  gray: {
    primary: "border-gray-600",
    secondary: "border-gray-200",
    bg: "bg-gray-600",
    text: "text-gray-600",
  },
};

export function Loader({
  className = "",
  size = "md",
  showText = true,
  text = "Loading...",
  variant = "spinner",
  color = "indigo",
}: LoaderProps) {
  const sizeClass = sizeMap[size];
  const textSizeClass = textSizeMap[size];
  const colors = colorMap[color];

  const renderSpinner = () => (
    <div className={`relative ${sizeClass}`}>
      <div
        className={`absolute inset-0 rounded-full border-2 ${colors.secondary}`}
      ></div>
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${colors.primary} border-t-2 animate-spin`}
      ></div>
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full ${colors.bg} ${size === 'xs' ? 'h-2 w-2' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`relative ${sizeClass}`}>
      <div
        className={`absolute inset-0 rounded-full ${colors.bg} animate-ping opacity-75`}
      ></div>
      <div
        className={`relative rounded-full ${colors.bg} ${sizeClass} animate-pulse`}
      ></div>
    </div>
  );

  const renderBars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${colors.bg} rounded-sm animate-pulse`}
          style={{
            width: size === 'xs' ? '3px' : size === 'sm' ? '4px' : '6px',
            height: size === 'xs' ? '12px' : size === 'sm' ? '16px' : '24px',
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s',
          }}
        ></div>
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "bars":
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
      role="status"
      aria-label="Loading"
    >
      {renderLoader()}
      {showText && (
        <div className={`${colors.text} ${textSizeClass} font-medium animate-pulse text-center`}>
          {text}
        </div>
      )}
    </div>
  );
}

// Inline loader for buttons and smaller spaces
export function InlineLoader({
  size = "sm",
  color = "indigo",
  className = "",
}: Pick<LoaderProps, "size" | "color" | "className">) {
  const sizeClass = sizeMap[size];
  const colors = colorMap[color];

  return (
    <div
      className={`relative ${sizeClass} ${className} flex items-center justify-center`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`absolute inset-0 rounded-full border-2 ${colors.secondary}`}
      ></div>
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${colors.primary} border-t-2 animate-spin`}
      ></div>
    </div>
  );
}

// Full screen loader overlay
export function LoaderOverlay({
  text = "Loading...",
  variant = "spinner",
  color = "indigo",
}: Pick<LoaderProps, "text" | "variant" | "color">) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="rounded-lg text-center bg-white p-8 shadow-xl dark:bg-gray-800">
        <Loader
          size="lg"
          variant={variant}
          color={color}
          text={text}
          showText={true}
        />
      </div>
    </div>
  );
}