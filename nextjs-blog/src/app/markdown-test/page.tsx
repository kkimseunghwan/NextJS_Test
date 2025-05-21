// src/app/markdown-test/page.tsx
import ReactMarkdown from "react-markdown";

const markdownContent = `
# 안녕하세요! 마크다운 테스트입니다.

이것은 일반 텍스트 문단입니다. **굵은 글씨**와 *기울임꼴*도 잘 나오는지 확인합니다.

## 소제목 입니다

- 목록 항목 1
- 목록 항목 2
  - 중첩된 목록 항목 2.1
  - 중첩된 목록 항목 2.2

1. 순서 있는 목록 1
2. 순서 있는 목록 2

> 이것은 인용구입니다.
> 여러 줄 인용구도 가능합니다.

\`\`\`javascript
// 이것은 코드 블록입니다.
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('World');
\`\`\`

[이것은 링크입니다](https://nextjs.org)
`;

export default function MarkdownTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">
        Markdown 출력 테스트 페이지
      </h1>

      {/* prose 클래스를 적용하여 Markdown 콘텐츠 스타일링 */}
      <article className="prose lg:prose-xl dark:prose-invert">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </article>
    </div>
  );
}
