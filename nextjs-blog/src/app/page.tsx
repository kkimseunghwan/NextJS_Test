// src/app/page.tsx
import MainSection from "@/components/homepage/MainSection";
import AboutSection from "@/components/homepage/AboutSection";
import TechStackSection from "@/components/homepage/TechStackSection";
import LatestPostsSection from "@/components/homepage/LatestPostsSection";
import ContactSection from "@/components/homepage/contactSection";

import {
  getAllSortedPostsData,
  getAllUniqueTagsWithCount, // 태그 기반으로 하려면 사용
  getAllUniqueCategoriesWithCount, // 카테고리 기반으로 하려면 사용
} from "@/lib/posts";
import type { PostData, TagWithCount } from "@/lib/posts";

import { Code, Zap } from "lucide-react";

// 1. Tech Stack에 표시하고자 하는 기술 이름과 해당 기술의 아이콘, 색상을 명시적으로 정의합니다.
//    이 객체의 key 값이 기준이 됩니다. (DB의 카테고리명 또는 태그명과 일치해야 함)
const DEFINED_SKILLS_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
    displayName: string; // 실제 그래프에 표시될 이름 (선택적)
  }
> = {
  Python: {
    icon: <Code size={16} className="text-blue-200" />,
    gradientFrom: "from-blue-500",
    gradientTo: "to-blue-700",
    displayName: "Python",
  },
  Algorithm: {
    icon: <Zap size={16} className="text-green-200" />,
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    displayName: "Algorithm",
  },
  JavaScript: {
    icon: <Code size={16} className="text-yellow-200" />,
    gradientFrom: "from-yellow-400",
    gradientTo: "to-amber-500",
    displayName: "JavaScript",
  },
  React: {
    icon: <Zap size={16} className="text-sky-200" />,
    gradientFrom: "from-sky-500",
    gradientTo: "to-cyan-600",
    displayName: "React",
  },
  "Next.js": {
    // DB에 저장된 이름이 "Next.js" 라면 이렇게 매칭
    icon: <Zap size={16} className="text-slate-200" />,
    gradientFrom: "from-slate-600",
    gradientTo: "to-gray-700",
    displayName: "Next.js",
  },
};

export default async function HomePage() {
  let latestPosts: PostData[] = [];
  let dbSkillsData: TagWithCount[] = [];

  try {
    latestPosts = (
      await getAllSortedPostsData(undefined, undefined, "latest")
    ).slice(0, 3);

    // Tech Stack 데이터를 DB에서 가져옵니다. (카테고리 또는 태그 기준)
    // 여기서는 카테고리 기준으로 가져오는 것으로 가정합니다.
    dbSkillsData = await getAllUniqueCategoriesWithCount();
    // 또는 태그 기준으로 가져오려면:
    // dbSkillsData = await getAllUniqueTagsWithCount();
  } catch (error) {
    console.error("Error fetching data for homepage:", error);
  }

  // 2. DEFINED_SKILLS_CONFIG에 정의된 기술들만 필터링하고, DB 데이터를 매핑합니다.
  const skillsForTechStackSection = Object.entries(DEFINED_SKILLS_CONFIG)
    .map(([skillKey, skillConfig]) => {
      // DB에서 가져온 데이터 중 현재 정의된 기술(skillKey)과 일치하는 항목을 찾습니다.
      // DB에 저장된 이름 (category 또는 tag name)과 DEFINED_SKILLS_CONFIG의 키가 일치해야 합니다.
      const dbSkill = dbSkillsData.find(
        (s) => s.name.toLowerCase() === skillKey.toLowerCase()
      );

      // DB에 해당 기술에 대한 게시물이 있고 (count > 0), DEFINED_SKILLS_CONFIG에 정의된 경우에만 포함
      if (dbSkill && dbSkill.count > 0) {
        return {
          name: skillConfig.displayName || skillKey, // displayName이 있으면 그것을 사용
          count: dbSkill.count,
          gradientFrom: skillConfig.gradientFrom,
          gradientTo: skillConfig.gradientTo,
          color: skillConfig.gradientFrom.split("-")[1], // 이 부분은 TechStackSection에서 실제로 사용되는지 확인 필요
          icon: skillConfig.icon,
        };
      }
      return null; // 정의되지 않았거나, DB에 게시물이 없는 경우는 null 반환
    })
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null) // null이 아닌 항목만 필터링
    .sort((a, b) => b.count - a.count); // 게시물 많은 순으로 정렬 (선택적)

  const totalSkillPosts = skillsForTechStackSection.reduce(
    (sum, skill) => sum + skill.count,
    0
  );

  return (
    <>
      <MainSection />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 via-slate-800 to-slate-900">
        <AboutSection />
        {/* skillsForTechStackSection에 데이터가 있을 때만 TechStackSection 렌더링 (선택적) */}
        {skillsForTechStackSection.length > 0 && (
          <TechStackSection
            skillsData={skillsForTechStackSection}
            totalSkillPosts={totalSkillPosts}
          />
        )}
        <LatestPostsSection latestPosts={latestPosts} />
      </div>
      <ContactSection />
    </>
  );
}

// LatestPostsSectionProps 인터페이스 정의는 이전과 동일하게 유지
interface LatestPostsSectionProps {
  latestPosts: PostData[];
}
