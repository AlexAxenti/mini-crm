"use client";

import { useState } from "react";

interface TooltipProps {
  message: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  message,
  children,
  position = "bottom",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return {
          container: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
          arrow:
            "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900",
        };
      case "bottom":
        return {
          container: "top-full left-1/2 transform -translate-x-1/2 mt-2",
          arrow:
            "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900",
        };
      case "left":
        return {
          container: "right-full top-1/2 transform -translate-y-1/2 mr-2",
          arrow:
            "absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900",
        };
      case "right":
        return {
          container: "left-full top-1/2 transform -translate-y-1/2 ml-2",
          arrow:
            "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900",
        };
      default:
        return {
          container: "top-full left-1/2 transform -translate-x-1/2 mt-2",
          arrow:
            "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900",
        };
    }
  };

  const { container, arrow } = getPositionClasses();

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${container} px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50`}
        >
          {message}
          <div className={arrow}></div>
        </div>
      )}
    </div>
  );
}
