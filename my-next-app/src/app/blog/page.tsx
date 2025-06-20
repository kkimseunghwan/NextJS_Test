// "use client";

import Link from 'next/link';
import { getPosts } from '@/lib/data';
import Image from 'next/image';
import {
  LayoutGrid,
  // Tag,
  ArrowRight,
  CalendarDays,
  TagIcon,
} from "lucide-react";

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }: BlogPageProps) {

  const pageTitle = "All Posts";
  const pageDescription = "모든 생각과 기록을 이곳에서 만나보세요.";

  // searchParams가 Promise이므로 await 처리
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const { posts, totalPages } = await getPosts(currentPage);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-900">
      <div className="container mx-auto">
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
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
        {posts && posts.length > 0 ? (
          // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          //   {posts.map((post) => (
          //     <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
          //       <div className="bg-slate-800/50 rounded-lg overflow-hidden h-full flex flex-col transition-all duration-300 hover:bg-slate-800 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
          //         {/* 커버 이미지 */}
          //         {post.featured_image && (
          //           <div className="relative h-48 w-full overflow-hidden">
          //             <Image 
          //               src={post.featured_image} 
          //               alt={post.title}
          //               className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          //             />
          //             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          //           </div>
          //         )}
                  
          //         <div className="p-6 flex-grow flex flex-col">
          //           <div className="flex-grow">
          //             <div className="flex items-center gap-2 mb-3">
          //               <Tag size={16} className="text-cyan-400" />
          //               <span className="text-sm font-semibold text-cyan-400">{post.category_name || '미분류'}</span>
          //             </div>
          //             <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{post.title}</h2>
          //             <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">{post.summary}</p>
          //           </div>
          //           <div className="flex items-center text-xs text-slate-500 pt-4 border-t border-slate-700/50">
          //             <Calendar size={14} className="mr-2" />
          //             <span>{new Date(post.notion_last_edited_time).toLocaleDateString('ko-KR')}</span>
          //           </div>
          //         </div>
          //       </div>
          //     </Link>
          //   ))}
          // </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {posts.map((post) => (
            
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
                      {/* <span>{formatDate(post.date)}</span> */}
                      <span>{new Date(post.notion_last_edited_time).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {/* <CategoryLinkClient category={post.category} /> 카테고리 연결 링크 기능 추후 추가 예정 */}
                    <span className="flex items-center gap-1 hover:text-purple-300 transition-colors cursor-pointer">

                      <TagIcon size={14} className="text-purple-400" />
                      <span className="truncate">{post.category_name}</span>
                    </span>
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
  
        ) : (
          <div className="text-center py-20 bg-slate-800/50 rounded-lg">
            <h3 className="text-2xl font-bold text-slate-300">작성된 게시물이 없습니다.</h3>
            <p className="text-slate-500 mt-2">연결을 확인해주세요</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 pt-8 border-t border-slate-800">
            <nav className="flex items-center gap-2">
              {/* Previous Button */}
              {currentPage > 1 && (
                <Link href={`/blog?page=${currentPage - 1}`} className="px-4 py-2 rounded-md bg-slate-800 hover:bg-cyan-500 transition-colors">
                  이전
                </Link>
              )}
              
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/blog?page=${page}`}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    page === currentPage 
                      ? 'bg-cyan-600 font-bold' 
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </Link>
              ))}

              {/* Next Button */}
              {currentPage < totalPages && (
                 <Link href={`/blog?page=${currentPage + 1}`} className="px-4 py-2 rounded-md bg-slate-800 hover:bg-cyan-500 transition-colors">
                  다음
                </Link>
              )}
            </nav>
          </div>
        )}
        
      </div>
    </div>
  );
}