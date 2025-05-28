// src/components/homepage/LatestPostsSection.tsx
import Link from "next/link";
import Image from "next/image";
import { getAllSortedPostsData } from "@/lib/posts";
// PostData 타입을 가져오도록 수정 (slug를 포함하고 있음)
import type { PostData } from "@/lib/posts";
import { CalendarDays, Tag as TagIcon, ArrowRight } from "lucide-react";

const MAX_POSTS_TO_SHOW = 3;

const formatDate = (dateString: string) => {
  if (!dateString) return "날짜 없음";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function LatestPostsSection() {
  // getAllSortedPostsData는 PostData[] 타입을 반환해야 합니다.
  const allPosts: PostData[] = getAllSortedPostsData();
  const latestPosts = allPosts.slice(0, MAX_POSTS_TO_SHOW);

  return (
    <section
      id="latest-posts-section"
      className="pl-10 pr-10 py-16 md:py-10 relative overflow-hidden scroll-mt-[80px]" // 섹션 패딩 약간 줄임
    >
      {/* 배경 패턴 (선택 사항) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_100%_100%,rgba(192,132,252,0.07),transparent_60%)]"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.05),transparent_60%)]"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative">
        {/* 헤더 왼쪽 정렬 */}
        <div className="mb-12 md:mb-7">
          {" "}
          {/* text-center 제거 */}
          <div className="flex items-center gap-4 mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28" // 아이콘 크기 조정
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4M4 22a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2M14 10l-2.5 2.5a1.5 1.5 0 0 0 0 2.1l.5.5a1.5 1.5 0 0 0 2.1 0L17 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Latest Posts
              </h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 mt-2 rounded-full"></div>{" "}
              {/* mx-auto 제거, 길이 조정 */}
            </div>
          </div>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl">
            {" "}
            {/* mx-auto 제거 */}
            가장 최근에 작성된 따끈따끈한 생각과 기록들입니다.
          </p>
        </div>

        {latestPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {" "}
            {/* gap-8에서 gap-6로 줄임 */}
            {latestPosts.map((post) => (
              <article
                key={post.slug} // posts.ts의 PostData 타입에 slug가 있다고 가정
                className="group bg-slate-800/60 backdrop-blur-md border border-slate-700/70 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-slate-900/60 hover:border-slate-600" // 그림자 및 보더 약간 조정, scale 효과 제거 (선택)
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.featured_image && (
                    <div className="relative w-full h-40 md:h-44 overflow-hidden">
                      {" "}
                      {/* 이미지 높이 h-56 -> h-40 또는 h-44 */}
                      <Image
                        src={post.featured_image}
                        alt={`${post.title} 대표 이미지`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" // duration 단축
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <div className="p-4 md:p-5">
                    {" "}
                    {/* 패딩 p-6 -> p-4 또는 p-5 */}
                    <div className="mb-2 flex items-center text-xs text-slate-400 space-x-2.5">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={12} /> {/* 아이콘 크기 */}
                        <span>{formatDate(post.date)}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <TagIcon size={12} /> {/* 아이콘 크기 */}
                          <span className="truncate text-xs">
                            {post.tags.slice(0, 1).join(", ")}{" "}
                            {/* 태그 1개만 표시 (선택) */}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors duration-200 line-clamp-2">
                      {" "}
                      {/* text-xl -> text-lg */}
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
                        {" "}
                        {/* text-sm -> text-xs, line-clamp-3 -> line-clamp-2 */}
                        {post.description}
                      </p>
                    )}
                    <div className="mt-auto">
                      <span className="inline-flex items-center text-xs font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200">
                        {" "}
                        {/* text-sm -> text-xs */}
                        Read More
                        <ArrowRight
                          size={14} // 아이콘 크기
                          className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-lg py-10">
            {" "}
            {/* 패딩 추가 */}
            최신 게시물이 아직 없습니다.
          </p>
        )}

        {allPosts.length > MAX_POSTS_TO_SHOW && (
          <div className="mt-12 md:mt-16 text-center">
            {" "}
            {/* 간격 조정 */}
            <Link
              href="/blog"
              className="group inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-7 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/30" // 패딩 약간 조정
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 group-hover:rotate-3 transition-transform"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              모든 게시물 보기
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
