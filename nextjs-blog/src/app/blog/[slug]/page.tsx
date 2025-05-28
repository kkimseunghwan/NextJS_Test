// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostSlugs, getPostDataBySlug } from "@/lib/posts";
import type { PostFullData } from "@/lib/posts";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeExtractToc from "@stefanprobst/rehype-extract-toc";
import { compile } from "@mdx-js/mdx";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx";

import type { Metadata } from "next";
import {
  CalendarDays,
  Tag as TagIcon,
  ListChecks,
  ArrowLeft,
  Clock,
} from "lucide-react";

// rehype-pretty-code 옵션
const rehypePrettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
  theme: "github-dark",
};

// 목차 항목 타입 정의
interface TocEntry {
  value: string;
  depth: number;
  id: string;
  children?: TocEntry[];
}

// TOC 컴포넌트 (인라인 목차용)
function InlineTableOfContents({ toc }: { toc: TocEntry[] }) {
  if (toc.length === 0) return null;

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
    <div className="mb-8 p-4 w-[500px] bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur-sm mx-auto">
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

// 사이드바 TOC 컴포넌트 (기존 유지)
function TableOfContentsLink({
  item,
  level = 1,
  currentHeadingId,
}: {
  item: TocEntry;
  level?: number;
  currentHeadingId?: string;
}) {
  const isActive = currentHeadingId === item.id;
  return (
    <li>
      <Link
        href={`#${item.id}`}
        className={`
          block py-1 pr-2 text-sm transition-colors duration-150 ease-in-out
          ${
            isActive
              ? "text-cyan-400 font-semibold border-r-2 border-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }
          ${level === 1 ? "pl-0" : ""}
          ${level === 2 ? "pl-3" : ""}
          ${level === 3 ? "pl-5 text-xs" : ""}
          ${level >= 4 ? "pl-7 text-xs" : ""}
        `}
      >
        {item.value}
      </Link>
      {item.children && item.children.length > 0 && (
        <ul className="mt-1">
          {item.children.map((subItem) => (
            <TableOfContentsLink
              key={subItem.id}
              item={subItem}
              level={level + 1}
              currentHeadingId={currentHeadingId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export async function generateStaticParams() {
  try {
    const paths = getAllPostSlugs();
    return paths;
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
  const postData = await getPostDataBySlug(slug);

  if (!postData) {
    return {
      title: "Post Not Found",
    };
  }

  const { title, description, tags, date, featured_image } = postData;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: `${title} | DEV_CONG Blog`,
    description: description || title,
    keywords: tags || [],
    openGraph: {
      title: title,
      description: description || title,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      publishedTime: date || undefined,
      images: featured_image
        ? [{ url: `${siteUrl}${featured_image}` }]
        : [`${siteUrl}/images/og-default.jpg`],
      tags: tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description || title,
      images: featured_image
        ? [`${siteUrl}${featured_image}`]
        : [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const postDataResult = await getPostDataBySlug(slug);

  if (!postDataResult) {
    notFound();
  }

  const {
    title,
    date,
    tags,
    content: markdownSource,
    featured_image,
  } = postDataResult as PostFullData;

  let toc: TocEntry[] = [];
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
  }

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "날짜 없음";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-300">
      <div className="container mx-auto max-w-6xl px-4">
        <main className="w-full">
          {/* 커버 이미지와 헤더 섹션 */}
          <div className="relative mb-6">
            {featured_image && (
              <div className="relative w-full h-80 md:h-96 lg:h-[28rem] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={featured_image}
                  alt={`${title} 대표 이미지`}
                  fill
                  className="object-cover"
                  priority
                />
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                {/* 커버 이미지 위 컨텐츠 */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="max-w-4xl">
                    {/* 제목 */}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                      {title}
                    </h1>

                    {/* 메타 정보 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                      {date && (
                        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CalendarDays size={14} />
                          <span>{formatDateString(date)}</span>
                        </div>
                      )}

                      {tags && tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <TagIcon size={14} />
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Link
                                key={tag}
                                href={`/blog?tag=${encodeURIComponent(tag)}`}
                                className="bg-cyan-600/80 hover:bg-cyan-500/90 text-xs text-white px-2.5 py-1 rounded-full transition-colors duration-150 backdrop-blur-sm"
                              >
                                {tag}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 커버 이미지가 없는 경우의 헤더 */}
            {!featured_image && (
              <header className="py-8 border-b border-slate-700 mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 leading-tight">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  {date && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      <span>{formatDateString(date)}</span>
                    </div>
                  )}
                  {tags && tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <TagIcon size={14} />
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
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
            )}
          </div>

          {/* 인라인 목차 (본문 전에 표시) */}
          <InlineTableOfContents toc={toc} />

          {/* 본문 */}
          <article
            className="
                mx-auto
                prose prose-sm sm:prose lg:prose-lg
                prose-invert 
                prose-headings:font-semibold prose-headings:text-slate-100 prose-headings:border-b prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:text-lg 
                prose-h1:text-4xl 
                prose-h2:text-2xl 
                prose-h3:text-xl
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm prose-p:mb-3
                prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-a:transition-colors prose-a:duration-150 prose-a:text-sm
                prose-strong:text-slate-200 prose-strong:text-sm
                prose-blockquote:border-l-cyan-500 prose-blockquote:text-slate-400 prose-blockquote:not-italic prose-blockquote:text-sm
                prose-code:bg-slate-800 prose-code:text-rose-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-xs
                prose-pre:bg-slate-800/70 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg prose-pre:shadow-lg prose-pre:p-0 prose-pre:text-xs
                prose-li:text-sm prose-li:text-slate-300
                prose-ul:text-sm prose-ol:text-sm
                max-w-none
              "
          >
            <MDXRemote
              source={markdownSource}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeRaw,
                    rehypeSlug,
                    [rehypePrettyCode, rehypePrettyCodeOptions] as any,
                  ],
                },
              }}
            />
          </article>

          {/* 하단 네비게이션 */}
          <footer className="mt-10 pb-10 pt-6 border-t border-slate-700">
            <Link
              href="/blog"
              className="group inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-150 text-sm"
            >
              <ArrowLeft
                size={16}
                className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
              />
              모든 게시물 보기
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
