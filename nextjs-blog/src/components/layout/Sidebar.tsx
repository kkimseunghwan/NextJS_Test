// src/components/layout/Sidebar.tsx
import Link from "next/link";
import Image from "next/image"; // 프로필 이미지용
import {
  Home,
  Github,
  Youtube,
  Search,
  Tag,
  Rss,
  LayoutGrid,
  BookMarked,
} from "lucide-react"; // 아이콘 예시
import { getAllUniqueTagsWithCount } from "@/lib/posts"; // 태그 데이터 가져오기

// Sidebar는 서버에서 데이터를 미리 가져와 렌더링할 수 있습니다.
// 또는 태그 목록을 클라이언트에서 가져오려면 이 컴포넌트를 'use client'로 만들고 useEffect 사용
export default function Sidebar() {
  const uniqueTags = getAllUniqueTagsWithCount(); // 서버 컴포넌트이므로 직접 호출 가능

  return (
    // <aside className="w-full h-full p-6 flex flex-col">
    <aside className="w-full h-full p-5 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-y-auto overflow-x-hidden custom-scrollbar-hide">
      {/* 배경 도형 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400 rotate-45 transform -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-400 rotate-12 transform translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-pink-400 rotate-45 transform -translate-x-8 -translate-y-8"></div>
      </div>

      {/* 빈 Border 도형 패턴 */}
      <div className="absolute top-4 right-4 w-8 h-8 border-2 border-cyan-400/30 transform rotate-45"></div>
      <div className="absolute bottom-8 left-4 w-6 h-6 border-2 border-purple-400/30 transform rotate-12"></div>

      {/* Profile Section - Gaming Card Style */}
      <div className="mb-8 relative">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 text-center relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="relative inline-block mb-3">
              <Image
                src="/profile.png"
                alt="Dev_Cong 프로필 사진"
                width={80}
                height={80}
                className="rounded-2xl border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20"
              />
              {/* Online Status Indicator */}
              {/* <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div> */}
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

      {/* 빠른 메뉴 버튼 */}
      {/* Navigation Menu - Gaming Style */}
      <nav className="space-y-2 mb-8">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          ◆ NAVIGATION
        </div>

        <Link href="/" className="group relative block">
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

      {/* 태그/카테고리 목록 */}
      {/* Categories Section - Gaming Panel Style */}
      {uniqueTags.length > 0 && (
        <div className="flex-grow">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
            ◆ CATEGORIES
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-3">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/blog"
                  className="group flex items-center px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-lg transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>
                  <LayoutGrid className="w-4 h-4 mr-2 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 font-medium">
                    전체 보기
                  </span>
                </Link>
              </li>
              {uniqueTags.map((tag) => (
                <li key={tag.name}>
                  <Link
                    href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                    className="group flex items-center px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>
                    <Tag className="w-4 h-4 mr-2 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 font-medium">
                      {tag.name}
                    </span>
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 bg-slate-700 group-hover:bg-cyan-500/30 text-slate-400 group-hover:text-cyan-300 rounded-full text-[0.7rem] font-mono transition-colors duration-150">
                        {tag.count}
                      </span>
                    </div>

                    {/* Gaming-style hex indicator */}
                    {/* <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-4 h-4 border border-cyan-400/50 transform rotate-45 flex items-center justify-center">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      </div>
                    </div> */}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* Bottom Gaming Accent */}
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
