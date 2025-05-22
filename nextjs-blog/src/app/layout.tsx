import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HwanDev Blog", // 기본 페이지 제목
    template: "%s | HwanDev Blog", // %s는 각 페이지의 title로 대체됨
  },
  description: "개발 이야기와 성장을 기록하는 공간입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* <Header /> */} {/* 공통 헤더 컴포넌트가 있다면 */}
        <main>{children}</main>
        {/* <Footer /> */} {/* 공통 푸터 컴포넌트가 있다면 */}
      </body>
    </html>
  );
}
