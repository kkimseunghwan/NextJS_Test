// src/components/layout/Sidebar.tsx
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Github,
  BookMarked,
  Tag,
  LayoutGrid, // 카테고리 아이콘으로 사용 또는 다른 적절한 아이콘 선택
} from "lucide-react";
// DB에서 데이터를 가져오는 함수들로 변경
import {
  getAllUniqueTagsWithCount,
  getAllUniqueCategoriesWithCount,
} from "@/lib/posts"; //
import type { TagWithCount } from "@/lib/posts";

// Sidebar는 서버 컴포넌트이므로 async/await를 사용하여 데이터 페칭 가능
export default async function Sidebar() {
  let uniqueTags: TagWithCount[] = [];
  let uniqueCategories: TagWithCount[] = [];

  try {
    uniqueTags = await getAllUniqueTagsWithCount(); // DB에서 태그 정보 가져오기
    uniqueCategories = await getAllUniqueCategoriesWithCount(); // DB에서 카테고리 정보 가져오기
  } catch (error) {
    console.error("Error fetching tags or categories for sidebar:", error);
    // 에러 발생 시 빈 배열로 유지
  }

  return (
    <aside className="w-full h-full p-5 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-y-auto overflow-x-hidden custom-scrollbar-hide">
      {/* 배경 도형 패턴 등 기존 UI 구조 유지 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400 rotate-45 transform -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-400 rotate-12 transform translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-pink-400 rotate-45 transform -translate-x-8 -translate-y-8"></div>
      </div>
      <div className="absolute top-4 right-4 w-8 h-8 border-2 border-cyan-400/30 transform rotate-45"></div>
      <div className="absolute bottom-8 left-4 w-6 h-6 border-2 border-purple-400/30 transform rotate-12"></div>

      {/* Profile Section */}
      <div className="mb-8 relative">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="relative inline-block mb-3">
              <Image
                src="/profile.png" // 프로필 이미지 경로는 public 폴더 기준
                alt="Dev_Cong 프로필 사진"
                width={80}
                height={80}
                className="rounded-2xl border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20"
                priority // 로고/프로필 이미지는 priority로 설정하여 빠르게 로드
              />
            </div>
            <h2 className="text-lg font-black text-white mb-3 tracking-wider">
              DEV_CONG
            </h2>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full">
              <span className="text-xs text-slate-300 font-medium">
                AI에게 먹혀버린www
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 mb-8">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          ◆ NAVIGATION
        </div>
        <Link href="/" className="group relative block">
          {/* ... 홈 링크 스타일 ... */}
          <div className="flex items-center px-4 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-xl hover:from-cyan-900/40 hover:to-cyan-800/40 hover:border-cyan-500/50 transition-all duration-300">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
            <Home className="w-5 h-5 mr-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
              홈
            </span>
            <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </Link>
        <Link href="/blog" className="group relative block">
          {/* ... 블로그 링크 스타일 ... */}
          <div className="flex items-center px-4 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-xl hover:from-purple-900/40 hover:to-purple-800/40 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
            <BookMarked className="w-5 h-5 mr-3 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
              블로그
            </span>
            <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </Link>
        <a
          href="https://github.com/kkimseunghwan"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block"
        >
          {/* ... GitHub 링크 스타일 ... */}
          <div className="flex items-center px-4 py-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/40 rounded-xl hover:from-pink-900/40 hover:to-pink-800/40 hover:border-pink-500/50 transition-all duration-300">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-pink-400 to-pink-600 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
            <Github className="w-5 h-5 mr-3 text-slate-400 group-hover:text-pink-400 transition-colors" />
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
              GitHub
            </span>
            <div className="ml-auto w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </a>
      </nav>

      {/* Categories Section */}
      {uniqueCategories.length > 0 && (
        <div className="mb-8">
          {" "}
          {/* Tags 섹션과의 구분을 위해 mb-8 추가 */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
            ◆ CATEGORIES
          </div>
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-3">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/blog" // 전체보기는 필터 없이
                  className="group flex items-center px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-lg transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>
                  <LayoutGrid className="w-4 h-4 mr-2 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 font-medium">
                    전체 보기
                  </span>
                </Link>
              </li>
              {uniqueCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={`/blog?filterType=category&filterValue=${encodeURIComponent(
                      category.name
                    )}`}
                    className="group flex items-center px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>
                    <LayoutGrid className="w-4 h-4 mr-2 text-slate-500 group-hover:text-slate-300 transition-colors" />{" "}
                    {/* 아이콘 변경 가능 */}
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 font-medium">
                      {category.name}
                    </span>
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 bg-slate-700 group-hover:bg-cyan-500/30 text-slate-400 group-hover:text-cyan-300 rounded-full text-[0.7rem] font-mono transition-colors duration-150">
                        {category.count}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tags Section */}
      {uniqueTags.length > 0 && (
        <div className="flex-grow">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
            ◆ TAGS
          </div>
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-3">
            <ul className="space-y-1">
              {/* 태그 목록에서는 '전체 보기'가 중복될 수 있으므로 필요에 따라 제거 또는 다르게 처리 */}
              {uniqueTags.map((tag) => (
                <li key={tag.name}>
                  <Link
                    href={`/blog?filterType=tag&filterValue=${encodeURIComponent(
                      tag.name
                    )}`}
                    className="group flex items-center px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mr-3 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>{" "}
                    {/* 태그 색상 변경 */}
                    <Tag className="w-4 h-4 mr-2 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 font-medium">
                      {tag.name}
                    </span>
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 bg-slate-700 group-hover:bg-pink-500/30 text-slate-400 group-hover:text-pink-300 rounded-full text-[0.7rem] font-mono transition-colors duration-150">
                        {" "}
                        {/* 태그 카운트 색상 변경 */}
                        {tag.count}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Accent */}
      <div className="mt-auto pt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </aside>
  );
}
