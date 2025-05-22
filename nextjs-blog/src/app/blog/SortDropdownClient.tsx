// src/app/blog/SortDropdownClient.tsx
"use client"; // 클라이언트 컴포넌트 명시

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // 현재 URL의 다른 searchParams를 유지하기 위해 사용

  const handleSortChange = (value: string) => {
    // 현재 URL의 모든 searchParams를 가져옵니다.
    const newParams = new URLSearchParams(searchParams.toString());

    // 'sort' 파라미터를 설정하거나 삭제합니다.
    if (value === "latest") {
      newParams.delete("sort"); // 'latest'가 기본값이면 파라미터에서 제거
    } else {
      newParams.set("sort", value);
    }
    // router.push를 사용하여 페이지를 이동(실제로는 리프레시하여 서버 컴포넌트가 새 데이터 로드)
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="정렬 기준" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">최신순</SelectItem>
        <SelectItem value="oldest">오래된순</SelectItem>
      </SelectContent>
    </Select>
  );
}
