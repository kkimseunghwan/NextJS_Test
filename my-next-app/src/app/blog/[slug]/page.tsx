import Link from "next/link";
import Image from "next/image";

import {
  CalendarDays,
  Tag as TagIcon,
  ArrowLeft,
} from "lucide-react";


type Props = {
  params: {
    slug: string; // params 안에는 string 타입의 slug가 들어있을 거야!
  }
}



export default async function BlogPostPage({ params }: Props) {
//   const slug = params.slug;

  return (
    <div className="bg-slate-900 min-h-screen text-slate-300 py-8">
      {" "}
      {/* 페이지 전체 패딩 추가 */}
      <div className="container mx-auto max-w-4xl px-4">
        {" "}
        {/* 콘텐츠 최대 너비 조정 */}
        <main className="w-full">
         
            {/* 커버 이미지와 헤더 섹션 */}
            <div className="mb-8">
                <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl mb-8">
                    <Image
                        src="/profile.png"
                        alt="테스트이미지지"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 960px" // sizes 속성 최적화
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>
            

                {/* 헤더 정보 */}
                <header
                className={
                    true ? "mb-8" : "py-8 border-b border-slate-700 mb-8" // 커버 이미지가 있을 때, 없을 때
                }
                >
                    {/* 제목 */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 leading-tight">
                        {params.slug} - 게시물 제목 
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
                        
                        {/* 게시물 등록 날짜 */}
                        <div className="flex items-center gap-1.5">
                            <CalendarDays size={16} />
                            <span>0000-00-00</span>
                        </div>

                        {/* 카테고리 (누르면 카테고리 페이지로 갈 수 있는) */}
                        <Link href="/" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                            <TagIcon size={16} className="text-purple-400" />
                            <span>카테고리고리</span>
                        </Link>
                    
                        {/* 태그 (여러개가 들어갈 수 있음) */}
                        <div className="flex items-center gap-1.5">
                            <TagIcon size={16} />
                            <div className="flex flex-wrap gap-2">
                                <Link
                                key="Key"
                                href="/"
                                className="bg-slate-700/70 hover:bg-cyan-600/30 text-xs text-slate-300 hover:text-cyan-200 px-2.5 py-1 rounded-full transition-colors duration-150"
                                >
                                태그
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* 인라인 목차 */}

            {/* 본문 */}
            <article
                className="
                prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl  
                prose-invert 
                prose-headings:font-semibold prose-headings:text-slate-100 prose-headings:border-b prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:mb-4 prose-headings:mt-8
                prose-h1:text-3xl sm:prose-h1:text-4xl 
                prose-h2:text-2xl sm:prose-h2:text-3xl
                prose-h3:text-xl sm:prose-h3:text-2xl
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base prose-p:mb-5
                prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-a:transition-colors prose-a:duration-150 prose-a:font-medium
                prose-strong:text-slate-100 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:text-slate-400 prose-blockquote:not-italic prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-6
                prose-code:bg-slate-800 prose-code:text-rose-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm
                prose-pre:bg-slate-800/70 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg prose-pre:shadow-lg prose-pre:p-0 prose-pre:text-sm
                prose-li:text-base prose-li:text-slate-300 prose-li:my-1
                prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 
                max-w-none 
                "
            >
                <p className="text-center text-slate-500 text-lg py-10">
                    게시물 내용을 불러올 수 없습니다.
                </p>
            </article>

            {/* 하단 네비게이션 */}
            <footer className="mt-12 pb-16 pt-8 border-t border-slate-700">
                <Link
                href="/blog"
                className="group inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-150 text-sm font-medium"
                >
                <ArrowLeft
                    size={18}
                    className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
                />
                블로그 목록으로 돌아가기
                </Link>
            </footer>
        
        </main>
      </div>
    </div>
  );
}
