// src/app/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getAllSortedPostsData } from "@/lib/posts"; // 수정된 posts.ts 임포트
import type { PostData } from "@/lib/posts"; //
import SortDropdown from "./SortDropdownClient"; //
import {
  CalendarDays,
  Tag as TagIcon,
  ArrowRight,
  LayoutGrid,
  Filter, // 필터 아이콘 추가
} from "lucide-react"; //
import CategoryLinkClient from "@/components/ui/CategoryLinkClient";

// ISR revalidate 시간 설정
export const revalidate = 3600; // 예시로 1시간

const formatDate = (dateString: string | undefined) => {
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
  searchParams?: {
    filterType?: "category" | "tag";
    filterValue?: string;
    sort?: string;
  };
}) {
  const currentFilterType = searchParams?.filterType;
  const currentFilterValue = searchParams?.filterValue;
  const currentSort = searchParams?.sort === "oldest" ? "oldest" : "latest";

  // DB에서 데이터 가져오기
  const posts = await getAllSortedPostsData(
    currentFilterType,
    currentFilterValue,
    currentSort
  );

  let pageTitle = "All Posts";
  let pageDescription = "모든 생각과 기록을 이곳에서 만나보세요.";

  if (currentFilterType && currentFilterValue) {
    const displayValue = decodeURIComponent(currentFilterValue);
    if (currentFilterType === "category") {
      pageTitle = `Category: ${displayValue}`;
      pageDescription = `'${displayValue}' 카테고리의 게시물 목록입니다.`;
    } else if (currentFilterType === "tag") {
      pageTitle = `Tag: #${displayValue}`;
      pageDescription = `'${displayValue}' 태그가 포함된 게시물 목록입니다.`;
    }
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-900">
      <div className="container mx-auto">
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                {currentFilterType ? (
                  <Filter size={24} className="text-white" />
                ) : (
                  <LayoutGrid size={24} className="text-white" />
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
            </div>
            <p className="text-slate-400">{pageDescription}</p>
          </div>
          <SortDropdown currentSort={currentSort} />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LayoutGrid size={40} className="text-slate-500" />
            </div>
            <p className="text-xl text-slate-400">
              {currentFilterValue
                ? `"${decodeURIComponent(
                    currentFilterValue
                  )}"에 해당하는 게시물이 없습니다.`
                : "아직 게시된 글이 없습니다."}
            </p>
            {currentFilterValue && (
              <Link
                href="/blog"
                className="mt-6 inline-block text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                &larr; 모든 게시물 보기
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {" "}
            {/* 반응형 컬럼 수 조정 */}
            {posts.map((post: PostData) => (
              <article
                key={post.id} // 고유한 id 사용
                className="group bg-slate-800/70 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 flex flex-col"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block flex flex-col flex-grow"
                >
                  {post.featured_image ? ( // DB에서 가져온 웹 경로 사용
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      {" "}
                      {/* 이미지 비율 유지 */}
                      <Image
                        src={post.featured_image} // 예: /api/images/slug/cover.jpg
                        alt={`${post.title} 대표 이미지`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[16/9] bg-slate-700/50 flex items-center justify-center">
                      <LayoutGrid size={48} className="text-slate-500" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-3 flex flex-wrap items-center text-xs text-slate-400 gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      {post.category && (
                        <CategoryLinkClient category={post.category} />
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors duration-200 flex-grow min-h-[2.8em] line-clamp-2">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-3 flex-grow min-h-[4.5em]">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
