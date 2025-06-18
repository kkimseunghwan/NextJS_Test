export type Post = {
  id: number;
  notion_id: string;
  title: string;
  category_id: number;
  tags: string | null; // JSON 문자열 형태의 태그
  status: string;
  created_time: string; // 또는 Date 타입
  notion_last_edited_time: string; // 또는 Date 타입
  content_md: string;
  slug: string;
  thumbnail_url: string | null;
  summary: string | null;
  category_name?: string; // JOIN 쿼리를 통해 카테고리 이름을 함께 가져올 경우를 대비
  featured_image?: string; // 썸네일 이미지 URL
};
