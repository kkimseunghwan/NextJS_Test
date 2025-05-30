// import { queryDb } from "./db";
import { queryDb } from "./db";
import type { RowDataPacket } from "mysql2";

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "blog");

// DB 스키마와 일치하도록 타입 정의
// 게시물 메타데이터
export interface PostFrontmatter {
  title: string;
  date: string; // (YYYY-MM-DDTHH:mm:ss.sssZ)
  tags?: string[];
  description?: string;
  featured_image?: string; // 웹 경로
  category?: string;
  post_type?: string;
}

export interface PostData extends PostFrontmatter {
  slug: string;
  id: string; // Page ID
  notion_last_edited_time: string;
}

// Markdown 본문
export interface PostFullData extends PostData {
  content: string;
}

export interface TocEntry {
  value: string;
  depth: number;
  id: string;
  children?: TocEntry[];
}

// 카테고리/태그별 개수
export interface TagWithCount {
  name: string;
  count: number;
}

// 헬퍼 함수: DB row를 PostData 객체로 매핑
async function mapDbRowToPostData(row: any): Promise<PostData> {
  const tags = await getTagsForPost(row.id);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    date: new Date(row.published_date).toISOString(),
    featured_image: row.featured_image || undefined,
    category: row.category || undefined,
    post_type: row.post_type,
    notion_last_edited_time: new Date(
      row.notion_last_edited_time
    ).toISOString(),
    tags: tags,
  };
}

// 헬퍼 함수: 특정 게시물 ID에 연결된 태그 목록 가져오기
async function getTagsForPost(postId: string): Promise<string[]> {
  const sql = `
    SELECT t.name
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
  `;
  try {
    const results = await queryDb<RowDataPacket[]>(sql, [postId]);
    return results.map((tagRow: any) => tagRow.name);
  } catch (error) {
    console.error(`Error fetching tags for post ${postId}:`, error);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

//

// 모든 게시물의 정렬된 메타데이터를 가져오는 함수 (목록 페이지용)
// 태그 필터링 기능을 추가합니다.
export async function getAllSortedPostsData(
  filterType?: "category" | "tag", // 필터 타입
  filterValue?: string,
  sortOrder: "latest" | "oldest" = "latest"
): Promise<PostData[]> {
  let sql = `
    SELECT DISTINCT
      p.id, p.slug, p.title, p.description, p.published_date,
      p.featured_image, p.category, p.post_type, p.notion_last_edited_time
    FROM posts p
  `;
  const params: any[] = [];

  if (filterType && filterValue) {
    if (filterType === "category") {
      sql += ` WHERE p.category = ?`;
      params.push(filterValue);
    } else if (filterType === "tag") {
      sql += `
        INNER JOIN post_tags pt ON p.id = pt.post_id
        INNER JOIN tags t ON pt.tag_id = t.id
        WHERE t.name = ?
      `;
      params.push(filterValue);
    }
  }

  sql += ` ORDER BY p.published_date ${
    sortOrder === "latest" ? "DESC" : "ASC"
  }`;

  try {
    const rows = await queryDb<RowDataPacket[]>(sql, params);
    // Promise.all을 사용하여 각 row에 대한 mapDbRowToPostData 비동기 호출을 병렬로 처리
    const posts = await Promise.all(rows.map((row) => mapDbRowToPostData(row)));
    return posts;
  } catch (error) {
    console.error("Error in getAllSortedPostsData:", error);
    return [];
  }
}

/**
 * DB에서 모든 고유 태그와 각 태그에 해당하는 게시물 수를 가져옵니다.
 */
export async function getAllUniqueTagsWithCount(): Promise<TagWithCount[]> {
  const sql = `
    SELECT t.name, COUNT(pt.post_id) as count
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    INNER JOIN posts p ON pt.post_id = p.id
    GROUP BY t.name
    ORDER BY count DESC, t.name ASC
  `;
  try {
    const results = await queryDb<RowDataPacket[]>(sql);
    return results.map((row) => ({
      name: row.name,
      count: Number(row.count),
    }));
  } catch (error) {
    console.error("Error in getAllUniqueTagsWithCount:", error);
    return [];
  }
}

/**
 * DB에서 모든 고유 카테고리와 각 카테고리에 해당하는 게시물 수를 가져옵니다.
 */
export async function getAllUniqueCategoriesWithCount(): Promise<
  TagWithCount[]
> {
  const sql = `
    SELECT category, COUNT(id) as count
    FROM posts
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC, category ASC
  `;
  try {
    const results = await queryDb<RowDataPacket[]>(sql);
    return results.map((row) => ({
      name: row.category,
      count: Number(row.count),
    }));
  } catch (error) {
    console.error("Error in getAllUniqueCategoriesWithCount:", error);
    return [];
  }
}

/**
 * DB에서 모든 게시물의 slug 목록을 가져옵니다. (generateStaticParams용)
 */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const sql = "SELECT slug FROM posts ORDER BY published_date DESC"; // 정렬 추가 (선택 사항)
  try {
    const results = await queryDb<RowDataPacket[]>(sql);
    return results.map((row: any) => ({
      slug: row.slug,
    }));
  } catch (error) {
    console.error("Error in getAllPostSlugs:", error);
    return [];
  }
}

/**
 * 특정 slug에 해당하는 게시물 데이터(메타데이터 + 본문)를 DB에서 가져옵니다.
 */
export async function getPostDataBySlug(
  slug: string
): Promise<PostFullData | null> {
  const sql = `
    SELECT
      p.id, p.slug, p.title, p.description, p.content, p.published_date,
      p.featured_image, p.category, p.post_type, p.notion_last_edited_time
    FROM posts p
    WHERE p.slug = ?
  `;
  try {
    const rows = await queryDb<RowDataPacket[]>(sql, [slug]);

    if (rows.length > 0) {
      const row = rows[0];
      const basePostData = await mapDbRowToPostData(row);
      return {
        ...basePostData,
        content: row.content || "",
      };
    }
    return null;
  } catch (error) {
    console.error(`Error in getPostDataBySlug for slug ${slug}:`, error);
    return null;
  }
}
