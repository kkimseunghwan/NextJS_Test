// src/app/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getAllSortedPostsData } from "@/lib/posts";
import type { PostData } from "@/lib/posts"; // posts.ts에서 PostData 타입 export 필요
import SortDropdown from "./SortDropdownClient"; // 정렬 드롭다운은 유지
import {
  CalendarDays,
  Tag as TagIcon,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";

const formatDate = (dateString: string) => {
  if (!dateString) return "날짜 없음";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { tag?: string; sort?: string };
}) {
  const currentTag = searchParams?.tag;
  const currentSort = searchParams?.sort === "oldest" ? "oldest" : "latest";

  const posts = getAllSortedPostsData(
    currentTag,
    currentSort as "latest" | "oldest"
  );
  // uniqueTags는 페이지 내 필터링 UI 제거로 인해 더 이상 직접적으로 필요하지 않음
  // const uniqueTags = getAllUniqueTags(); // 이 줄은 제거하거나 주석 처리

  return (
    // 페이지 전체 패딩 및 배경 (사이드바와 유사한 어두운 배경)
    <div className="p-6 md:p-10 min-h-screen bg-slate-900">
      {" "}
      {/* 전체 페이지 배경 및 패딩 */}
      <div className="container mx-auto ">
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12 pl-20">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <LayoutGrid size={24} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {currentTag ? `@${currentTag} Posts` : "All Posts"}
              </h1>
            </div>
            <p className="text-slate-400">
              {currentTag
                ? `'${currentTag}' 태그 게시물 목록`
                : "모든 생각과 기록을 이곳에서 만나보세요."}
            </p>
          </div>
          <SortDropdown currentSort={currentSort} />
        </div>

        {/* 태그별 이동 UI 제거됨 */}

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LayoutGrid size={40} className="text-slate-500" />
            </div>
            <p className="text-xl text-slate-400">
              {currentTag
                ? `"${currentTag}" 태그에 해당하는 게시물이 없습니다.`
                : "아직 게시된 글이 없습니다."}
            </p>
            {currentTag && (
              <Link
                href="/blog"
                className="mt-6 inline-block text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                &larr; 모든 게시물 보기
              </Link>
            )}
          </div>
        ) : (
          // 게시물 카드 그리드
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-5 ml-20 mr-20">
            {posts.map(
              (
                post: PostData // 타입 명시
              ) => (
                <article
                  key={post.slug} // 또는 post.id (posts.ts의 반환값에 따라)
                  className="group bg-slate-800/70 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 flex flex-col"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block flex flex-col flex-grow"
                  >
                    {post.featured_image ? (
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={post.featured_image}
                          alt={`${post.title} 대표 이미지`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="relative w-full h-48 bg-slate-700/50 flex items-center justify-center">
                        {/* 대표 이미지 없을 때 placeholder */}
                        <LayoutGrid size={48} className="text-slate-500" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-grow">
                      {" "}
                      {/* 패딩 조정 */}
                      <div className="mb-3 flex items-center text-xs text-slate-400 space-x-3">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          <span>{formatDate(post.date)}</span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-1 overflow-hidden">
                            <TagIcon size={14} />
                            <span className="truncate text-xs">
                              {post.tags.slice(0, 2).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors duration-200 flex-grow min-h-[2.5em] line-clamp-2">
                        {" "}
                        {/* 제목 영역 최소 높이 확보 및 line-clamp */}
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-3 flex-grow min-h-[4.5em]">
                          {" "}
                          {/* 설명 영역 최소 높이 확보 및 line-clamp */}
                          {post.description}
                        </p>
                      )}
                      <div className="mt-auto pt-3 border-t border-slate-700/50">
                        <span className="inline-flex items-center text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200">
                          Read More
                          <ArrowRight
                            size={16}
                            className="ml-1 group-hover:translate-x-1 transition-transform duration-200"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
