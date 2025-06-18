// 데이터 조회 테스트 API

import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/data'; // 모든 게시물을 가져오는 함수

export async function GET() {
  try {
    // DB에서 모든 게시물 데이터를 가져옵니다.
    const posts = await getPosts();
    
    // 성공적으로 가져온 데이터를 JSON 형태로 응답합니다.
    return NextResponse.json(posts);

  } catch (error) {
    // 에러 발생 시, 콘솔에 로그를 남기고 500 상태 코드와 함께 에러 메시지를 응답합니다.
    console.error('게시물 API 조회 오류:', error);
    return NextResponse.json(
      { error: '서버에서 데이터를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}