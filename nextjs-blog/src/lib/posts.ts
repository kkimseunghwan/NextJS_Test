// src/lib/posts.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "blog");

// 게시물 메타데이터 타입을 정의합니다. (기존 코드와 일치 또는 확장)
export interface PostFrontmatter {
  title: string;
  date: string;
  tags?: string[];
  description?: string;
  featured_image?: string; // 이미지
  // 필요에 따라 다른 필드 추가 (예: summary)
}

interface PostData extends PostFrontmatter {
  slug: string;
}

interface PostFullData extends PostData {
  content: string;
}

// 모든 게시물의 정렬된 메타데이터를 가져오는 함수 (목록 페이지용)
// 태그 필터링 기능을 추가합니다.
export function getAllSortedPostsData(
  tag?: string,
  sortOrder: "latest" | "oldest" = "latest" // 기본값은 'latest'
): PostData[] {
  let fileNames: string[];
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (err) {
    console.warn(
      `Could not read posts directory at ${postsDirectory}. No posts will be loaded. Error: ${err}`
    );
    return [];
  }

  let allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      slug,
      ...(matterResult.data as PostFrontmatter),
    };
  });

  // 태그가 제공되면 해당 태그를 포함하는 게시물만 필터링합니다.
  if (tag) {
    allPostsData = allPostsData.filter(
      (post) => post.tags && post.tags.includes(tag)
    );
  }

  // 게시물을 날짜(date) 기준으로 정렬합니다.
  return allPostsData.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (sortOrder === "latest") {
      return dateB - dateA; // 최신순 (내림차순)
    } else {
      return dateA - dateB; // 오래된순 (오름차순)
    }
  });
}

// 타입을 정의.
export interface TagWithCount {
  name: string;
  count: number;
}

// 모든 고유 태그 목록을 가져오는 함수
export function getAllUniqueTagsWithCount(): TagWithCount[] {
  const allPosts = getAllSortedPostsData(); // 필터링 없이 모든 게시물을 가져옵니다.
  const tagsDict: { [key: string]: number } = {};

  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags?.forEach((tag) => {
        if (tagsDict[tag]) {
          tagsDict[tag]++;
        } else {
          tagsDict[tag] = 1;
        }
      });
    }
  });

  const sortedTagsWithCount = Object.entries(tagsDict)
    .map(([name, count]) => ({ name, count })) // 객체 형태로 변환
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count; // 게시물 많은 순
      }
      return a.name.localeCompare(b.name); // 이름 순
    });

  return sortedTagsWithCount;
}

// 모든 게시물의 slug 목록을 가져오는 함수 (generateStaticParams용) - 기존과 동일
export function getAllPostSlugs() {
  // ... (기존 코드와 동일)
  let fileNames: string[];
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (err) {
    return [];
  }

  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ""),
    };
  });
}

// 특정 slug에 해당하는 게시물 데이터(메타데이터 + 본문)를 가져오는 함수 - 기존과 동일
export async function getPostDataBySlug(
  slug: string
): Promise<PostFullData | null> {
  // ... (기존 코드와 동일, 반환 타입 PostFullData로 명시)
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      slug,
      content: matterResult.content,
      ...(matterResult.data as PostFrontmatter),
    };
  } catch (err) {
    console.error(`Error reading or parsing post ${slug}: ${err}`);
    return null;
  }
}

// 다른 파일에서 import type { PostData } from '@/lib/posts'; 하려면
// PostData 타입 임포트 (src/lib/posts.ts에 PostData 인터페이스가 export 되어 있어야 함)
export type { PostData };
