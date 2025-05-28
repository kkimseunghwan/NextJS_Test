// src/app/blog/SortDropdownClient.tsx
"use client"; // 클라이언트 컴포넌트 명시

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (value === "latest") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }

    router.push(`${pathname}?${newParams.toString()}`);
    setIsOpen(false);
  };

  const sortOptions = [
    { value: "latest", label: "최신순", icon: "↓" },
    { value: "oldest", label: "오래된순", icon: "↑" },
  ];

  const currentOption = sortOptions.find(
    (option) => option.value === currentSort
  );

  return (
    <div className="relative">
      {/* Gaming Style Select Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl hover:from-cyan-900/40 hover:to-cyan-800/40 hover:border-cyan-500/50 transition-all duration-300 min-w-[160px]"
      >
        {/* Gaming Accent Line */}
        <div className="absolute left-[155px] top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-l-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

        {/* Sort Icon */}
        <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />

        {/* Current Selection */}
        <div className="flex items-center gap-2 flex-grow">
          <span className="text-xs font-mono text-cyan-400 opacity-80">
            {currentOption?.icon}
          </span>
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {currentOption?.label}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Gaming Style Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Gaming Header */}
            <div className="px-4 py-2 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-b border-slate-600/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  SORT ORDER
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    currentSort === option.value
                      ? "bg-gradient-to-r from-cyan-900/40 to-cyan-800/40 border border-cyan-500/50"
                      : "hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50"
                  }`}
                >
                  {/* Option Icon */}
                  <span
                    className={`text-sm font-mono transition-colors ${
                      currentSort === option.value
                        ? "text-cyan-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {option.icon}
                  </span>

                  {/* Option Label */}
                  <span
                    className={`text-sm font-semibold transition-colors flex-grow text-left ${
                      currentSort === option.value
                        ? "text-white"
                        : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {option.label}
                  </span>

                  {/* Gaming Style Check */}
                  {currentSort === option.value && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
