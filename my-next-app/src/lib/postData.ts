import { executeQuery } from './db';
import { RowDataPacket } from 'mysql2/promise';

// 데이터베이스 쿼리 결과 타입 정의
interface PostQueryResult extends RowDataPacket {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  post_type: string;
  category_id: number;
  published_date: string;
  featured_image: string | null;
  notion_last_edited_time: string;
  created_at: string;
  updated_at: string;
  category_name: string | null;
  tags: string | null; // GROUP_CONCAT 결과는 문자열 또는 null
}

interface ImageQueryResult extends RowDataPacket {
  web_path: string;
  caption: string | null;
  created_at: string;
}

type PostData = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    content: string | null;
    post_type: string;
    category_id: number;
    published_date: string;
    featured_image: string | null;
    notion_last_edited_time: string;
    created_at: string;
    updated_at: string;
    category_name: string | null;
    tags: string[];
    images: Array<{
        web_path: string;
        caption: string | null;
        created_at: string;
    }>;
}

export async function getPostDataSQL(slug: string): Promise<PostData | null> {
  try {
    console.log(`Searching for post with slug: ${slug}`);

    // 게시글과 관련 데이터를 한 번에 조회
    const postSql = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.description,
        p.content,
        p.post_type,
        p.category_id,
        p.published_date,
        p.featured_image,
        p.notion_last_edited_time,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        GROUP_CONCAT(DISTINCT t.name ORDER BY t.name ASC SEPARATOR ',') as tags
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = ?
      GROUP BY p.id, p.title, p.slug, p.description, p.content, p.post_type, 
               p.category_id, p.published_date, p.featured_image, 
               p.notion_last_edited_time, p.created_at, p.updated_at, c.name
    `;

    const results = await executeQuery<PostQueryResult>(postSql, [slug]);

    // 결과가 없으면 null 반환
    if (!results || results.length === 0) {
      console.log('No posts found with slug:', slug);
      return null;
    }

    const postData = results[0];

    // postData가 유효한지 확인
    if (!postData || !postData.id) {
      console.error('Post data is invalid:', postData);
      return null;
    }

    // 이미지 데이터 별도 조회
    const imagesSql = `
      SELECT web_path, caption, created_at
      FROM images 
      WHERE post_id = ? 
      ORDER BY created_at ASC
    `;

    const imageResults = await executeQuery<ImageQueryResult>(imagesSql, [postData.id]);

    // PostData 타입으로 변환
    const post: PostData = {
      id: postData.id,
      title: postData.title,
      slug: postData.slug,
      description: postData.description,
      content: postData.content,
      post_type: postData.post_type,
      category_id: postData.category_id,
      published_date: postData.published_date,
      featured_image: imageResults.length > 0 ? imageResults[0].web_path : postData.featured_image,
      notion_last_edited_time: postData.notion_last_edited_time,
      created_at: postData.created_at,
      updated_at: postData.updated_at,
      category_name: postData.category_name,
      tags: postData.tags ? postData.tags.split(',').map(tag => tag.trim()) : [],
      images: imageResults.map(img => ({
        web_path: img.web_path,
        caption: img.caption,
        created_at: img.created_at
      }))
    };

    return post;

  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    throw new Error('Failed to fetch post.');
  }
}
