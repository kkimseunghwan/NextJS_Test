import { executeQuery } from './db';
import type { Post } from '@/types/post';

// 한 페이지에 표시할 게시글 수
const POSTS_PER_PAGE = 9; 

interface PostsResponse {
  posts: Post[];
  totalPosts: number;
  totalPages: number;
}

export async function getPosts(currentPage: number = 1): Promise<PostsResponse> {

    try {
        // 1. 전체 게시글 수 계산
        const countQuery = 'SELECT COUNT(*) as count FROM posts WHERE status = ?';
        const countParams = ['Published'];
        const countResult = await executeQuery(countQuery, countParams);
        
        const totalPosts = countResult[0].count;
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

        // 2. 현재 페이지에 해당하는 게시글 목록 조회
        const offset = (currentPage - 1) * POSTS_PER_PAGE;
        const postsQuery = `
            SELECT p.*, c.name as category_name 
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = ?
            ORDER BY p.created_time DESC 
            LIMIT ? OFFSET ?`;
        const postsParams = ['Published', POSTS_PER_PAGE, offset];
        const postsResult = await executeQuery(postsQuery, postsParams);

        return {
            posts: postsResult as Post[],
            totalPosts,
            totalPages,
        };

    } catch (error) {
        console.error('Error fetching posts:', error);
        // 프로덕션에서는 더 정교한 에러 처리가 필요합니다.
        return { posts: [], totalPosts: 0, totalPages: 0 };
  }
}
