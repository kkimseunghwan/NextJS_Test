// src/app/blog/page.tsx (Server Component)
import Link from "next/link";
import Image from "next/image";
import { getAllSortedPostsData, getAllUniqueTagsWithCount } from "@/lib/posts";
import type { PostData } from "@/lib/posts";
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
  const uniqueTags = getAllUniqueTagsWithCount();

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
              key={tag.name}
              href={`/blog?tag=${encodeURIComponent(tag.name)}${
                currentSort !== "latest" ? `&sort=${currentSort}` : ""
              }`}
              className={`px-3 py-1 text-sm rounded-full transition-colors
                          ${
                            currentTag === tag.name
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500"
                          }`}
            >
              {tag.name}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(
            ({
              slug,
              title,
              date,
              tags,
              description,
              featured_image,
            }: PostData) => (
              <article
                key={slug}
                className="group border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
              >
                <Link href={`/blog/${slug}`} className="block">
                  {/* 커버 이미지 섹션 */}
                  <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                    {featured_image ? (
                      <Image
                        src={featured_image}
                        alt={`${title} 커버 이미지`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* 날짜 오버레이 */}
                    {date && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatDate(date)}
                      </div>
                    )}
                  </div>

                  {/* 콘텐츠 섹션 */}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {title}
                    </h2>

                    {description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {description}
                      </p>
                    )}

                    {tags && tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tagItem) => (
                          <span
                            key={tagItem}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full"
                          >
                            {tagItem}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="text-gray-500 text-xs font-medium px-2 py-1">
                            +{tags.length - 3}개
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}
