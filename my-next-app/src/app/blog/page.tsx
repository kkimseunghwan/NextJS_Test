
// 1. next/link에서 Link를 가져옵니다.
import Link from 'next/link'; 

export default function Home() {
  return (
    <main>
      <h1>여기는 블로그랍니다</h1>

      <h2>BLOG</h2>
      <h2>BLOG</h2>
      <h2>BLOG</h2>
      <h2>BLOG</h2>
      <h2>BLOG</h2>

      {/* 2. a 태그 대신 Link 태그를 사용합니다. */}
      <Link href="/">
        메인 페이지로 돌아가기
      </Link>
    </main>
  );
}