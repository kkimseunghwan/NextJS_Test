// my-next-app/src/app/api/postData/route.ts

import { NextResponse } from 'next/server';
// lib/data.ts 에 getPostDataSQL 함수가 있다고 가정합니다.
import { getPostDataSQL } from '@/lib/postData';

export async function GET(request: Request) {
  // URL에서 slug 파라미터를 가져오는 로직 (예시)
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const post = await getPostDataSQL(slug);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // ❗❗❗ 해결 방법: DB 결과를 순수한 JSON 객체로 변환 ❗❗❗
    const serializablePost = JSON.parse(JSON.stringify(post));

    // 변환된 객체를 응답으로 전달합니다.
    return NextResponse.json(serializablePost);

  } catch (error) {
    console.error('게시물 API 조회 오류:', error);
    return NextResponse.json({ error: 'Failed to fetch post data' }, { status: 500 });
  }
}