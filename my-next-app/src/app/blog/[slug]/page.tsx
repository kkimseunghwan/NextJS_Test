import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from 'rehype-raw';
import { getPostDataSQL } from "@/lib/postData";


import {
  CalendarDays,
  Tag as TagIcon,
  ArrowLeft,
} from "lucide-react";
import remarkGfm from "remark-gfm";

// 타입 정의
type Props = {
  params: Promise<{ slug: string }>;
};

const md = `
# This is a H1
## This is a H2
### This is a H3
#### This is a H4
##### This is a H5
###### This is a H6

1. first
2. second
3. third

* 안녕하세요.
* hi
* 하이

# 할 일
* [x] 개발하기
* [ ] 테스트하기
* [ ] ~~배포하기~~
`;

export default async function BlogPostPage({ params: paramsPromise }: Props) {
    try {
        const params = await paramsPromise;
        const post = await getPostDataSQL(params.slug);
        
        // 게시물이 없으면 404 페이지를 보여줍니다.
        if (!post) {
            console.error(`Post not found for slug: ${params.slug}`);
            notFound(); // Next.js의 404 페이지로 리다이렉트
        }

        // 커버 이미지 처리 - featured_image가 있으면 사용, 없으면 기본 이미지
        const coverImage = post.featured_image || "/profile.png";
        const hasCoverImage = !!post.featured_image;

        return (
            <div className="bg-slate-900 min-h-screen text-slate-300 py-8">
                <div className="container mx-auto max-w-4xl px-4">
                    <main className="w-full">
                    
                        {/* 커버 이미지와 헤더 섹션 */}
                        <div className="mb-8">
                            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl mb-8">
                                <Image
                                    src={coverImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 960px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                            </div>
                        

                            {/* 헤더 정보 */}
                            <header className={hasCoverImage ? "mb-8" : "py-8 border-b border-slate-700 mb-8"}>
                                {/* 제목 */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 leading-tight">
                                    {post.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400 mb-6">
                                    
                                    {/* 게시물 등록 날짜 */}
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays size={16} />
                                        <span>{new Date(post.notion_last_edited_time).toLocaleDateString('ko-KR')}</span>
                                    </div>

                                    {/* 카테고리 */}
                                    {post.category_name && (
                                        <Link href="/" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                                            <TagIcon size={16} className="text-purple-400" />
                                            <span>{post.category_name}</span>
                                        </Link>
                                    )}
                                </div>
                            
                                {/* 태그 섹션 */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 mb-10 pb-8 border-b border-slate-700">
                                        <TagIcon size={16} className="text-slate-400" />
                                        {post.tags.map((tag, index) => (
                                            <Link
                                                key={`${tag}-${index}`}
                                                href={`/blog/tags/${encodeURIComponent(tag)}`}
                                                className="bg-slate-700/70 hover:bg-cyan-600/30 text-xs text-slate-300 hover:text-cyan-200 px-3 py-1.5 rounded-full transition-colors duration-150"
                                            >
                                                # {tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </header>
                        </div>

                        {/* 본문 */}
                        <article>
                            <ReactMarkdown>
                                {post.content}
                            </ReactMarkdown>
                            <ReactMarkdown>{md}</ReactMarkdown>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
                        </article>

                        {/* 게시물 메타 정보 */}
                        <section className="mt-12 mb-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">게시물 정보</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                                <div>
                                    <span className="font-medium text-slate-300">게시일:</span> {new Date(post.published_date).toLocaleDateString('ko-KR')}
                                </div>
                                <div>
                                    <span className="font-medium text-slate-300">최종 수정:</span> {new Date(post.notion_last_edited_time).toLocaleDateString('ko-KR')}
                                </div>
                                <div>
                                    <span className="font-medium text-slate-300">카테고리:</span> {post.category_name || '미분류'}
                                </div>
                                <div>
                                    <span className="font-medium text-slate-300">타입:</span> {post.post_type}
                                </div>
                            </div>
                        </section>

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

    } catch (error) {
        console.error('Error loading blog post:', error);
        // 에러 발생 시 404 페이지로 리다이렉트
        notFound();
    }
}