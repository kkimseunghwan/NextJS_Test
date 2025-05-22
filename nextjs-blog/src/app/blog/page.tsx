// src/app/blog/page.tsx (Server Component)
// 오류 분석:
// 1. 템플릿 리터럴 내에서 잘못된 문자열 보간 구문 사용
// 2. 타입 정의 부족으로 인한 타입 오류들
// 3. JSX 문법 오류

import Link from "next/link";
import { getAllSortedPostsData, getAllUniqueTags } from "@/lib/posts";
import type { PostData } from "@/lib/posts"; // PostData 타입 임포트 추가
import SortDropdown from "./SortDropdownClient";

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
  const uniqueTags = getAllUniqueTags();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "날짜 없음";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          {currentTag ? `태그: ${currentTag}` : "블로그 게시물"}
        </h1>
        <SortDropdown currentSort={currentSort} />
      </div>

      {uniqueTags.length > 0 && (
        <div className="mb-8 text-center flex flex-wrap justify-center items-center gap-2">
          <span className="mr-2 font-semibold">태그:</span>
          <Link
            href={`/blog${
              currentSort !== "latest" ? `?sort=${currentSort}` : ""
            }`}
            className={`px-3 py-1 text-sm rounded-full transition-colors
                        ${
                          !currentTag
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500"
                        }`}
          >
            전체보기
          </Link>
          {uniqueTags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}${
                currentSort !== "latest" ? `&sort=${currentSort}` : ""
              }`}
              className={`px-3 py-1 text-sm rounded-full transition-colors
                          ${
                            currentTag === tag
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500"
                          }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center">
          <p>
            {currentTag
              ? `"${currentTag}" 태그에 해당하는 게시물이 없습니다.`
              : "아직 게시된 글이 없습니다."}
          </p>
        </div>
      ) : (
        <ul className="space-y-6">
          {posts.map(({ slug, title, date, tags, description }: PostData) => (
            <li
              key={slug}
              className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
            >
              <Link href={`/blog/${slug}`} className="block mb-2">
                <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                  {title}
                </h2>
              </Link>
              {date && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  발행일: {formatDate(date)}
                </p>
              )}
              {description && (
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {description}
                </p>
              )}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tagItem) => (
                    <Link
                      key={tagItem}
                      href={`/blog?tag=${encodeURIComponent(tagItem)}${
                        currentSort !== "latest" ? `&sort=${currentSort}` : ""
                      }`}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      {tagItem}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
