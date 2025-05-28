// src/components/layout/TopNavbar.tsx
import Link from "next/link";

export default function TopNavbar() {
  return (
    <nav className="shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* 왼쪽 메뉴 (About, Projects 등) */}
        <div className="flex space-x-4">
          <Link href="/about" className="text-gray-200 hover:text-blue-400">
            About
          </Link>
          <Link href="/about" className="text-gray-200 hover:text-blue-400">
            Posts
          </Link>
          <Link href="/about" className="text-gray-200 hover:text-blue-400">
            Project
          </Link>
          {/* 다른 메뉴 항목들 추가 */}
        </div>

        {/* 오른쪽 검색창 또는 다른 요소들 */}
        <div>
          {/* <SearchInput /> 검색 컴포넌트 위치 */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            (검색창 위치)
          </p>
        </div>
      </div>
    </nav>
  );
}
