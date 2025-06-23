
// 1. next/link에서 Link를 가져옵니다.
// import Link from 'next/link'; 

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const md = `
# This is a H1
## This is a H2
### This is a H3
#### This is a H4
##### This is a H5
###### This is a H6

1. first
2. second
3. third

* 안녕하세요.
* hi
* 하이

# 할 일
* [x] 개발하기
* [ ] 테스트하기
* [ ] ~~배포하기~~
`;

export default function Home() {
  return (
    <main>
      <h1>여기는 Link 테스트 페이지.</h1>

      {/* 2. a 태그 대신 Link 태그를 사용합니다. */}
      <ReactMarkdown>{md}</ReactMarkdown>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </main>
  );
}