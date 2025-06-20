import { executeQuery } from './db';
import type { Post } from '@/types/post';

// 한 페이지에 표시할 게시글 수
const POSTS_PER_PAGE = 12;

interface PostsResponse {
  posts: Post[];
  totalPosts: number;
  totalPages: number;
}

export async function getPosts(currentPage: number = 1): Promise<PostsResponse> {

    try {
        // 1. 전체 게시글 수 계산
        const countQuery = 'SELECT COUNT(*) as count FROM posts';
        const countResult = await executeQuery(countQuery);
        
        const totalPosts = countResult[0].count;
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

        // 현재 페이지가 1보다 작거나 총 페이지 수보다 크면 조정
        currentPage = Math.max(1, Math.min(currentPage, totalPages)); 
        console.log(`Fetching posts for page ${currentPage} of ${totalPages}`);
        
        // 2. 현재 페이지에 해당하는 게시글 목록 조회
        const limit = POSTS_PER_PAGE;
        const offset = (currentPage - 1) * limit;
        const postsQuery = `
            SELECT p.*, c.name as category_name 
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.notion_last_edited_time DESC 
            LIMIT ${limit} OFFSET ${offset}`;
    
        const postsResult = await executeQuery(postsQuery);

        return {
            posts: postsResult as Post[],
            totalPosts,
            totalPages,
        };

    } catch (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], totalPosts: 0, totalPages: 0 };
  }
}
