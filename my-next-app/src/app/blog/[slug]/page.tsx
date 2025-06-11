// app/products/[productId]/page.js

// URL이 '/products/123' 일 경우,
// params는 { productId: '123' } 객체가 됩니다.

import Link from "next/link";

// 컴포넌트가 받을 props의 타입을 미리 정의
type Props = {
    params : {
        slug: string
    }
}

export default function ProductDetailPage({ params }: Props) {

  // 보통 이 productId를 사용해 DB나 API에서 상품 정보를 가져옵니다.

  return (
    <div style={{ padding: '20px' }}>
      <h1>게시글 제목: {params.slug}</h1>
      <p>이곳에 {params.slug}에 대한 내용이 들어갑니다...</p>
      <br />
      <Link href="/">홈으로 돌아가기</Link>
    </div>
  );
}