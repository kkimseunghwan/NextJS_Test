import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostSlugs, getPostDataBySlug } from "@/lib/posts"; // 수정된 posts.ts 임포트/page.tsx]
import type { PostFullData, TocEntry } from "@/lib/posts"; ///page.tsx]
import Image from "next/image";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; ///page.tsx]
import rehypeExtractToc from "@stefanprobst/rehype-extract-toc";
import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code"; ///page.tsx]
import rehypeSlug from "rehype-slug"; ///page.tsx]
import { compile } from "@mdx-js/mdx"; ///page.tsx]
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx"; ///page.tsx]

import type { Metadata } from "next";
import {
  CalendarDays,
  Tag as TagIcon,
  ListChecks,
  ArrowLeft,
} from "lucide-react"; ///page.tsx]

// ISR revalidate 시간 설정 (초 단위)
// 예: 1시간마다 페이지를 재생성 시도 (백그라운드에서)
// 개발 중에는 더 짧게 설정하거나, 0으로 설정하여 매 요청마다 재생성(SSR처럼 동작)하도록 할 수 있습니다.
// 프로덕션에서는 적절한 값으로 설정합니다. (예: 3600 = 1시간, 86400 = 24시간)
export const revalidate = 3600; // 예시로 1시간 설정

const rehypePrettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
  theme: "github-dark", ///page.tsx]
};

// TOC 컴포넌트 (인라인 목차용 - 기존 코드 유지)/page.tsx]
function InlineTableOfContents({ toc }: { toc: TocEntry[] }) {
  if (!toc || toc.length === 0) return null;

  const renderTocItem = (item: TocEntry, level = 1) => (
    <li key={item.id}>
      <Link
        href={`#${item.id}`}
        className={`
          block py-1 px-2 text-sm rounded transition-colors duration-150 ease-in-out
          text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50
          ${level === 1 ? "font-medium" : ""}
          ${level === 2 ? "ml-3 text-xs" : ""}
          ${level === 3 ? "ml-5 text-xs text-slate-400" : ""}
          ${level >= 4 ? "ml-7 text-xs text-slate-500" : ""}
        `}
      >
        {item.value}
      </Link>
      {item.children && item.children.length > 0 && (
        <ul className="mt-1">
          {item.children.map((subItem) => renderTocItem(subItem, level + 1))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="mb-8 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur-sm lg:w-3/4 xl:w-2/3 mx-auto">
      {" "}
      {/* 너비 조정 */}
      <div className="flex items-center gap-2 mb-3">
        <ListChecks size={18} className="text-cyan-400" />
        <h2 className="text-base font-semibold text-slate-200">목차</h2>
      </div>
      <nav>
        <ul className="space-y-1">{toc.map((item) => renderTocItem(item))}</ul>
      </nav>
    </div>
  );
}

// DB에서 slug 목록을 가져와 정적 경로 생성
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs(); // DB에서 슬러그 목록 가져오기
    return slugs.map((item) => ({ slug: item.slug }));
  } catch (error) {
    console.error("Failed to generate static params for blog posts:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const postData = await getPostDataBySlug(slug); // DB에서 데이터 가져오기

  if (!postData) {
    return {
      title: "Post Not Found",
    };
  }

  const { title, description, tags, date, featured_image } = postData;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // featured_image 경로는 이제 DB에 저장된 웹 경로 (예: /api/images/...)를 사용
  const ogImage = featured_image
    ? `${siteUrl}${featured_image}`
    : `${siteUrl}/images/og-default.jpg`;

  return {
    title: `${title} | HwanDev Blog`, // 프로젝트 메타데이터와 일관성 있게 수정
    description: description || title,
    keywords: tags || [],
    openGraph: {
      title: title,
      description: description || title,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      publishedTime: date ? new Date(date).toISOString() : undefined,
      images: [{ url: ogImage }],
      tags: tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description || title,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const postData = await getPostDataBySlug(slug); // DB에서 데이터 가져오기

  if (!postData) {
    notFound();
  }

  const {
    title,
    date,
    tags,
    content: markdownSource,
    featured_image, // DB에서 가져온 웹 경로
    category, // category도 사용 가능
  } = postData;

  let toc: TocEntry[] = [];
  if (markdownSource) {
    try {
      const { data } = await compile(markdownSource, {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          rehypeExtractToc,
          [withTocExport, { name: "toc" }],
        ],
      });
      if (data && data.toc) {
        toc = data.toc as TocEntry[];
      }
    } catch (error) {
      console.error("Error compiling MDX for TOC extraction:", error);
      // TOC 생성 실패 시 빈 배열로 유지
    }
  }

  const formatDateString = (dateStr: string | undefined) => {
    if (!dateStr) return "날짜 없음";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
            {featured_image && ( // featured_image는 이제 DB에서 가져온 웹 경로
              <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl mb-8">
                <Image
                  src={featured_image} // 이 경로는 /api/images/... 형태가 될 것임
                  alt={`${title} 대표 이미지`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 960px" // sizes 속성 최적화
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
            )}

            {/* 헤더 정보 */}
            <header
              className={
                featured_image ? "mb-8" : "py-8 border-b border-slate-700 mb-8"
              }
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 leading-tight">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
                {date && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={16} />
                    <span>{formatDateString(date)}</span>
                  </div>
                )}
                {category && (
                  <Link
                    href={`/blog?filterType=category&filterValue=${encodeURIComponent(
                      category
                    )}`}
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <TagIcon size={16} className="text-purple-400" />
                    <span>{category}</span>
                  </Link>
                )}
                {tags && tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <TagIcon size={16} />
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?filterType=tag&filterValue=${encodeURIComponent(
                            tag
                          )}`}
                          className="bg-slate-700/70 hover:bg-cyan-600/30 text-xs text-slate-300 hover:text-cyan-200 px-2.5 py-1 rounded-full transition-colors duration-150"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </header>
          </div>

          {/* 인라인 목차 */}
          {toc && toc.length > 0 && <InlineTableOfContents toc={toc} />}

          {/* 본문 */}
          {markdownSource ? (
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
              <MDXRemote
                source={markdownSource}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeRaw, // HTML 직접 사용 허용
                      rehypeSlug,
                      [rehypePrettyCode, rehypePrettyCodeOptions] as any, // 코드 하이라이팅
                    ],
                  },
                }}
              />
            </article>
          ) : (
            <p className="text-center text-slate-500 text-lg py-10">
              게시물 내용을 불러올 수 없습니다.
            </p>
          )}

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
