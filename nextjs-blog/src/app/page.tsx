// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import TopNavbar from "@/components/layout/TopNavbar";
import { getAllUniqueTagsWithCount } from "@/lib/posts";
import type { TagWithCount } from "@/lib/posts";
import {
  ChevronDown,
  UserCircle,
  Zap,
  Code,
  Github,
  Mail,
  Coffee,
  Sparkles,
} from "lucide-react";

import HeroSection from "@/components/homepage/MainSection";
import AboutSection from "@/components/homepage/AboutSection";
import TechStackSection from "@/components/homepage/TechStackSection";
import LatestPostsSection from "@/components/homepage/LatestPostsSection";
import ContactSection from "@/components/homepage/contactSection";

// 역량 그래프에 표시할 태그 및 색상 정의
const SKILLS_TO_SHOW: Record<
  string,
  {
    color: string;
    gradientFrom: string;
    gradientTo: string;
    icon?: React.ReactNode;
  }
> = {
  Python: {
    color: "bg-blue-500",
    gradientFrom: "from-blue-500",
    gradientTo: "to-blue-600",
    icon: <Code size={16} className="text-blue-200" />,
  },
  Algorithm: {
    color: "bg-green-500",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    icon: <Zap size={16} className="text-green-200" />,
  },
  JavaScript: {
    color: "bg-red-500",
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-600",
    icon: <Zap size={16} className="text-green-200" />,
  },
  React: {
    color: "bg-green-500",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    icon: <Zap size={16} className="text-green-200" />,
  },
};

export default function HomePage() {
  const allTagsWithCount: TagWithCount[] = getAllUniqueTagsWithCount();

  const skillsData = Object.entries(SKILLS_TO_SHOW)
    .map(([skillName, skillInfo]) => {
      const tagData = allTagsWithCount.find(
        (tag) =>
          tag.name.toLowerCase() === skillName.toLowerCase().replace("_", ".")
      );
      return {
        name: skillName.replace("_", "."),
        count: tagData ? tagData.count : 0,
        color: skillInfo.color,
        gradientFrom: skillInfo.gradientFrom,
        gradientTo: skillInfo.gradientTo,
        icon: skillInfo.icon,
      };
    })
    .filter((skill) => skill.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalSkillPosts = skillsData.reduce(
    (sum, skill) => sum + skill.count,
    0
  );

  return (
    <>
      <HeroSection />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 via-slate-800 to-slate-900">
        <AboutSection />
        <TechStackSection
          skillsData={skillsData}
          totalSkillPosts={totalSkillPosts}
        />
        <LatestPostsSection />
      </div>
      <ContactSection />
    </>
  );
}
