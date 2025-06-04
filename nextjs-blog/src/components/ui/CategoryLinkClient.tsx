// 예시: CategoryLinkClient.tsx (클라이언트 컴포넌트)
'use client';
import { useRouter } from 'next/navigation';
import { Tag as TagIcon } from 'lucide-react';

interface CategoryLinkProps {
  category: string;
}

export default function CategoryLinkClient({ category }: CategoryLinkProps) {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation(); // 부모 Link의 내비게이션 방지
    router.push(`/blog?filterType=category&filterValue=${encodeURIComponent(category)}`);
  };

  return (
    <span
      onClick={handleClick}
      className="flex items-center gap-1 hover:text-purple-300 transition-colors cursor-pointer"
    >
      <TagIcon size={14} className="text-purple-400" />
      <span className="truncate">{category}</span>
    </span>
  );
}