// app/page.js

import Link from 'next/link'; // 1. next/link에서 Link를 가져옵니다.

export default function Home() {
  return (
    <main>
      <h1>여기는 Link 테스트 페이지.</h1>

      {/* 2. a 태그 대신 Link 태그를 사용합니다. */}
      <Link href="/">
        제 프로필 보러가기
      </Link>
    </main>
  );
}