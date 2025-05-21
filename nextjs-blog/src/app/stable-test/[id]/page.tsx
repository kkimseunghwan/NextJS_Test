// src/app/stable-test/[id]/page.tsx

// 이 페이지 컴포넌트는 params 객체를 prop으로 직접 받습니다.
// Next.js App Router의 표준적인 방식입니다.
export default function StableTestIdPage({
  params,
}: {
  params: { id: string };
}) {
  // params 객체나 그 속성(id)을 사용하기 위해 await 할 필요가 없습니다.
  const testId = params.id;

  console.log(`[StableTestIdPage] ID from params is: ${testId}`);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Stable Dynamic Route Test Page</h1>
      <p>
        Requested ID: <strong>{testId}</strong>
      </p>
      <p>
        Please check the server console (where you ran `npm run dev`) for any
        &quot;params should be awaited&quot; errors.
      </p>
    </div>
  );
}
