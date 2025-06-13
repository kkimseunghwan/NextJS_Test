"use client";

// src/app/blog/page.tsx
// import Link from "next/link";
// import Image from "next/image";
import {
  LayoutGrid,
} from "lucide-react";

export default function BlogPage() {

  const pageTitle = "All Posts";
  const pageDescription = "모든 생각과 기록을 이곳에서 만나보세요.";

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-900">
      <div className="container mx-auto">
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                {/* {currentFilterType ? (
                  <Filter size={24} className="text-white" />
                ) : (
                  <LayoutGrid size={24} className="text-white" />
                )} */}
                <LayoutGrid size={24} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
            </div>
            <p className="text-slate-400">{pageDescription}</p>
          </div>
          {/* <SortDropdown currentSort={currentSort} /> */}
        </div>


        {/* 게시물 목록 */}

        
      </div>
    </div>
  );
}
