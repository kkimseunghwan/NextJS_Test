// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc"; // MDXRemoteProps 추가
import {
  getAllPostSlugs,
  getPostDataBySlug,
  // type BlogPost, // 필요하다면 BlogPost 타입 정의를 가져옵니다.
} from "@/lib/posts";

// Markdown 처리를 위한 플러그인 임포트
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug"; // 제목에 ID 부여
import rehypeExtractToc from "@stefanprobst/rehype-extract-toc"; // 목차 데이터 추출
// import rehypeAutolinkHeadings from 'rehype-autolink-headings'; // 제목에 자동 링크 (선택 사항)

import { compile } from "@mdx-js/mdx";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx"; // withTocExport 임포트

import type { Metadata } from "next";

// rehype-pretty-code 옵션 설정
const rehypePrettyCodeOptions = {
  theme: "github-dark",
};

// 목차 항목 타입 정의 (참조 코드와 유사하게)
interface TocEntry {
  value: string;
  depth: number;
  id: string; // rehype-slug가 생성한 ID
  children?: TocEntry[];
}

// generateStaticParams 함수는 동일하게 유지
export async function generateStaticParams() {
  try {
    const paths = getAllPostSlugs();
    return paths;
  } catch (error) {
    console.error("Failed to generate static params for blog posts:", error);
    return [];
  }
}

// 목차 UI를 위한 재귀 컴포넌트
function TableOfContentsLink({
  item,
  level = 1,
}: {
  item: TocEntry;
  level?: number;
}) {
  return (
    <li>
      <Link
        href={`#${item.id}`}
        className={`block hover:text-gray-900 dark:hover:text-gray-100 
                    ${level === 1 ? "font-semibold" : ""} 
                    ${level === 2 ? "ml-2" : ""} 
                    ${level === 3 ? "ml-4 text-sm" : ""}
                    ${level >= 4 ? `ml-6 text-xs` : ""}
                    py-1`}
      >
        {item.value}
      </Link>
      {item.children && item.children.length > 0 && (
        <ul className="pl-2">
          {item.children.map((subItem) => (
            <TableOfContentsLink
              key={subItem.id}
              item={subItem}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const postData = await getPostDataBySlug(slug);

  if (!postData) {
    // 게시물을 찾지 못한 경우 기본 또는 에러 메타데이터 반환
    return {
      title: "포스트를 찾을 수 없습니다",
      description: "요청하신 블로그 포스트를 찾을 수 없습니다.",
    };
  }

  const { title, description, tags, date } = postData;
  // 만약 frontmatter에 summary 대신 description을 사용한다면:
  // const { title, description, tags, date } = postData;

  const pageDescription = description || `"${title}"에 대한 게시물입니다.`; // summary가 없다면 기본 설명 사용

  return {
    title: `${title} | Hwan's Dev Blog`, // 예시: "게시물 제목 | Hwan's Dev Blog"
    description: pageDescription,
    keywords: tags || [], // tags가 있다면 keywords로 사용
    alternates: {
      canonical: `/blog/${slug}`, // 현재 페이지의 대표 URL
    },
    openGraph: {
      // 소셜 미디어 공유 시 사용될 정보
      title: title,
      description: pageDescription,
      type: "article",
      publishedTime: date || undefined, // 발행일
      url: `<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_SITE\_URL \|\| 'http\://localhost\:3000'\}/blog/</span>{slug}`, // 전체 URL
      // images: [ // 대표 이미지가 있다면 여기에 URL 추가
      //   {
      //     url: '대표_이미지_URL',
      //     width: 800,
      //     height: 600,
      //     alt: title,
      //   },
      // ],
      tags: tags || [],
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

  const { title, date, tags, content: markdownSource } = postDataResult;

  // 1. MDX 컴파일하여 TOC 데이터 추출
  let toc: TocEntry[] = [];
  try {
    // compile 함수는 서버 사이드에서만 실행되어야 합니다.
    // 이 페이지 컴포넌트 자체가 Server Component이므로 여기서 사용 가능합니다.
    const { data } = await compile(markdownSource, {
      // MDXRemote의 mdxOptions와 유사하게 설정
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug, // 제목에 ID 부여 (TOC 링크 대상)
        rehypeExtractToc, // TOC 데이터 구조 생성
        [withTocExport, { name: "toc" }], // 생성된 TOC 데이터를 'toc'라는 이름으로 export (data.toc로 접근 가능)
      ],
      // outputFormat: 'function-body', // MDXRemote와 함께 사용할 때는 'function-body'가 일반적이나,
      // 여기서는 data 추출이 주 목적이므로 기본값으로도 충분할 수 있습니다.
    });
    if (data && data.toc) {
      toc = data.toc as TocEntry[];
    }
  } catch (error) {
    console.error("Error compiling MDX for TOC extraction:", error);
    // TOC 생성 실패 시 빈 목차로 진행
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "날짜 없음";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 목차를 위한 임시 데이터 (실제로는 rehype-extract-toc 결과 사용)
  // 이 부분은 실제로는 rehype-extract-toc 등을 통해 동적으로 생성되어야 합니다.
  // 예시를 위해 하드코딩합니다. 실제 구현에서는 Markdown 파싱 시 추출해야 합니다.
  // `getPostDataBySlug` 함수가 TOC 데이터도 함께 반환하도록 수정하거나,
  // 이 페이지 컴포넌트 내에서 `compile` 함수를 사용하여 TOC를 추출해야 합니다.
  // 지금은 레이아웃만 잡기 위해 임시 목차 데이터를 사용합니다.
  const temporaryToc: TocEntry[] = [
    // {id: '제목-id-1', value: '첫 번째 주요 제목', depth: 2, children: [
    //   {id: '소제목-id-1-1', value: '첫 번째 소제목', depth: 3}
    // ]},
    // {id: '제목-id-2', value: '두 번째 주요 제목', depth: 2},
  ];
  // 실제 TOC 데이터는 아래와 같이 mdxOptions 실행 결과에서 가져와야 합니다.
  // MDXRemote options을 설정할 때, 데이터를 추출할 수 있는 방법이 필요합니다.
  // `next-mdx-remote`는 렌더링에 집중하므로, TOC 데이터는 compile 과정에서 별도 추출이 일반적입니다.
  // 이 예제에서는 우선 TOC UI 레이아웃만 잡고, 실제 데이터 연동은 생략합니다.

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-8">
        {" "}
        {/* 본문 + 오른쪽 목차 레이아웃 */}
        <article className="w-full">
          <header className="mb-8">
            <h1 className="!text-3xl md:!text-5xl font-extrabold mb-3 !leading-tight">
              {title}
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {date && <p>발행일: {formatDate(date)}</p>}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span>태그:</span>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert">
            <MDXRemote
              source={markdownSource}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeRaw,
                    rehypeSlug, // MDXRemote 렌더링 시에도 제목 ID가 필요
                    [rehypePrettyCode, rehypePrettyCodeOptions] as any,
                  ],
                },
              }}
            />
          </div>

          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/blog"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              &larr; 모든 게시물 보기
            </Link>
          </footer>
        </article>
        {/* 오른쪽 목차 사이드바 (lg 이상 화면에서 표시) */}
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            목차
          </h2>{" "}
          {/* mb-3에서 mb-4로 변경 */}
          {toc.length > 0 ? (
            <nav>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                {toc.map((item) => (
                  <TableOfContentsLink key={item.id} item={item} />
                ))}
              </ul>
            </nav>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              이 글에는 목차가 없습니다.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
