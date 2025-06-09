// src/lib/posts.ts

import { queryDb } from "./db";
import type { RowDataPacket } from "mysql2";

// --- 타입 정의 ---

// DB의 posts 테이블 행과 일치하는 타입 (GROUP_CONCAT으로 tags 추가)
interface DbPostRow extends RowDataPacket {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content?: string; // 상세 페이지에서만 사용
  published_date: Date;
  featured_image: string | null;
  category: string | null;
  post_type: string;
  notion_last_edited_time: Date;
  tags: string | null; // GROUP_CONCAT의 결과는 콤마로 구분된 문자열 또는 NULL
}

// 프론트엔드에서 사용할 게시물 메타데이터 타입
export interface PostFrontmatter {
  title: string;
  date: string; // ISO 8601 문자열
  tags: string[];
  description?: string;
  featured_image?: string;
  category?: string;
  post_type?: string;
}

// 목록 등에서 사용할 기본 게시물 데이터 타입
export interface PostData extends PostFrontmatter {
  slug: string;
  id: string;
  notion_last_edited_time: string;
}

// 상세 페이지에서 사용할 전체 게시물 데이터 타입
export interface PostFullData extends PostData {
  content: string;
}

// 카테고리/태그별 개수 타입
export interface TagWithCount {
  name: string;
  count: number;
}

// --- 헬퍼 함수 ---

// DB에서 받은 행 데이터를 프론트엔드용 PostData 객체로 변환하는 중앙화된 함수
function mapDbRowToPostData(row: DbPostRow): PostData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || undefined,
    date: new Date(row.published_date).toISOString(),
    featured_image: row.featured_image || undefined,
    category: row.category || undefined,
    post_type: row.post_type,
    notion_last_edited_time: new Date(
      row.notion_last_edited_time
    ).toISOString(),
    tags: row.tags ? row.tags.split(',') : [], // 콤마로 구분된 문자열을 배열로 변환
  };
}


// --- 데이터 호출 함수 ---

/**
 * 모든 게시물의 정렬된 메타데이터를 가져옵니다. (단일 쿼리로 최적화됨)
 */
export async function getAllSortedPostsData(
  filterType?: "category" | "tag",
  filterValue?: string,
  sortOrder: "latest" | "oldest" = "latest"
): Promise<PostData[]> {
  // 기본 쿼리: posts 테이블을 기준으로 tags 테이블과 LEFT JOIN
  let sql = `
    SELECT
      p.id, p.slug, p.title, p.description, p.published_date,
      p.featured_image, p.category, p.post_type, p.notion_last_edited_time,
      GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') as tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
  `;
  
  const whereClauses: string[] = [];
  const params: any[] = [];

  // 필터링 조건 추가
  if (filterType === 'category' && filterValue) {
    whereClauses.push("p.category = ?");
    params.push(filterValue);
  }

  // 태그 필터링은 서브쿼리 또는 별도 JOIN을 사용하여 처리
  if (filterType === 'tag' && filterValue) {
    whereClauses.push("p.id IN (SELECT post_id FROM post_tags pt_filter INNER JOIN tags t_filter ON pt_filter.tag_id = t_filter.id WHERE t_filter.name = ?)");
    params.push(filterValue);
  }
  
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  
  // GROUP BY 및 ORDER BY 추가
  sql += `
    GROUP BY p.id
    ORDER BY p.published_date ${sortOrder === "latest" ? "DESC" : "ASC"}
  `;
  
  try {
    const rows = await queryDb<DbPostRow[]>(sql, params);
    return rows.map(mapDbRowToPostData);
  } catch (error) {
    console.error("Error in getAllSortedPostsData:", error);
    throw error; // 오류를 상위로 전파하여 페이지 레벨에서 처리하도록 함
  }
}

/**
 * 특정 slug에 해당하는 게시물 전체 데이터를 가져옵니다. (단일 쿼리로 최적화됨)
 */
export async function getPostDataBySlug(
  slug: string
): Promise<PostFullData | null> {
  const sql = `
    SELECT
      p.id, p.slug, p.title, p.description, p.content, p.published_date,
      p.featured_image, p.category, p.post_type, p.notion_last_edited_time,
      GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') as tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = ?
    GROUP BY p.id
  `;
  try {
    const rows = await queryDb<DbPostRow[]>(sql, [slug]);

    if (rows.length > 0) {
      const row = rows[0];
      const postData = mapDbRowToPostData(row);
      return {
        ...postData,
        content: row.content || "",
      };
    }
    return null;
  } catch (error) {
    console.error(`Error in getPostDataBySlug for slug ${slug}:`, error);
    throw error;
  }
}

/**
 * 모든 고유 태그와 각 태그에 해당하는 게시물 수를 가져옵니다.
 */
export async function getAllUniqueTagsWithCount(): Promise<TagWithCount[]> {
  const sql = `
    SELECT t.name, COUNT(pt.post_id) as count
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
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
    throw error;
  }
}

/**
 * 모든 고유 카테고리와 각 카테고리에 해당하는 게시물 수를 가져옵니다.
 */
export async function getAllUniqueCategoriesWithCount(): Promise<TagWithCount[]> {
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
    throw error;
  }
}

/**
 * 모든 게시물의 slug 목록을 가져옵니다. (generateStaticParams용)
 */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const sql = "SELECT slug FROM posts";
  try {
    const results = await queryDb<RowDataPacket[]>(sql);
    return results.map((row: any) => ({
      slug: row.slug,
    }));
  } catch (error) {
    console.error("Error in getAllPostSlugs:", error);
    throw error;
  }
}
