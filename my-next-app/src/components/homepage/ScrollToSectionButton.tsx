// src/components/ScrollToSectionButton.tsx
"use client"; // 클라이언트 컴포넌트임을 명시

import React from "react";
import { ChevronDown } from "lucide-react";

interface ScrollToSectionButtonProps {
  targetId: string;
  buttonText: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function ScrollToSectionButton({
  targetId,
  buttonText,
  className,
  icon,
}: ScrollToSectionButtonProps) {
  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleScroll}
      className={
        className ||
        "group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
      }
    >
      <span className="flex items-center gap-2">
        {buttonText}
        {icon || (
          <ChevronDown
            size={16}
            className="group-hover:translate-y-1 transition-transform"
          />
        )}
      </span>
    </a>
  );
}
