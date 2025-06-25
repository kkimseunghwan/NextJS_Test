// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 또는 사용하시는 다른 폰트
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar"; // Sidebar 임포트
import TopNavbar from "@/components/layout/TopNavbar"; // TopNavbar 임포트 (주석 해제 가정)

const inter = Inter({ subsets: ["latin"] }); // 사용하시는 폰트에 맞게 수정

export const metadata: Metadata = {
  title: {
    default: "HwanDev Blog",
    template: "%s | HwanDev Blog",
  },
  description: "개발 이야기와 성장을 기록하는 공간입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.className} antialiased`}>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <div className="flex">
          {" "}
          {/* min-h-screen은 body 또는 html에 적용되거나, 필요시 여기에 추가 */}
          {/* 왼쪽 사이드바 */}
          <div className="hidden md:flex md:w-64 lg:w-64 flex-col fixed inset-y-0 z-40">
            {" "}
            {/* flex-col 추가 */}
            <Sidebar />{" "}
            {/* Sidebar 자체에서 h-full 또는 flex-1을 사용하여 내부 스크롤 관리 */}
          </div>
          {/* 오른쪽 메인 영역 */}
          <div className="flex-1 flex flex-col md:ml-64 lg:ml-64">
            {" "}
            {/* Sidebar 너비만큼 marginLeft */}
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            {/* 이 main 태그가 실제 스크롤을 담당합니다. */}
            <main className="flex-1">
              {/* overflow-y-auto는 이 main 태그의 부모인 '오른쪽 메인 영역' div가 
                  화면 높이를 초과할 경우 자연스럽게 body 스크롤이 생기도록 하거나,
                  만약 TopNavbar와 Footer를 고정시키고 싶다면 main에 h-0와 함께 overflow-y-auto를 줄 수 있습니다.
                  여기서는 body 스크롤을 기본으로 합니다.
              */}
              {children}
            </main>
            {/* 푸터 (선택 사항) */}
            <footer className="p-4 text-right bg-black text-xs text-gray-400 border-t border-gray-700">
              © 2025 Dev_Cong. All rights reserved.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
