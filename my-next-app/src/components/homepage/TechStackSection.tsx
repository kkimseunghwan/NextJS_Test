"use client";

import React, { useState, useEffect } from "react";
import { Code, Zap } from "lucide-react";

interface SkillData {
  name: string;
  count: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon?: React.ReactNode;
}

interface ApiResponse {
  success: boolean;
  data: {
    name: string;
    count: number;
  }[];
}

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
  ETC: {
    icon: <Code size={16} className="text-purple-200" />,
    gradientFrom: "from-purple-500",
    gradientTo: "to-indigo-600",
    displayName: "ETC",
  },
  Network: {
    icon: <Zap size={16} className="text-orange-200" />,
    gradientFrom: "from-orange-500",
    gradientTo: "to-red-600",
    displayName: "Network",
  },
};

// 모의 API 데이터 (실제 환경에서는 제거하고 실제 API 사용)
const mockApiData: ApiResponse = {
  success: true,
  data: [
    { name: "Python", count: 15 },
    { name: "Algorithm", count: 8 },
    { name: "JavaScript", count: 12 },
    { name: "React", count: 10 },
    { name: "ETC", count: 5 },
    { name: "Network", count: 3 },
  ]
};

async function fetchSkillsData(): Promise<ApiResponse> {
  // 실제 환경에서는 아래 코드를 사용하세요:
  // return await fetch('/api/categories').then(res => res.json());
  
  // 데모용 모의 데이터
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockApiData), 500);
  });
}

export default function TechStackSection() {
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkillsData = async () => {
      try {
        setLoading(true);
        const response = await fetchSkillsData();
        
        if (response.success) {
          // DEFINED_SKILLS_CONFIG와 매칭하여 최종 기술 스택 데이터를 생성
          const processedSkills: SkillData[] = response.data
            .filter(skill => DEFINED_SKILLS_CONFIG[skill.name]) // config에 정의된 스킬만 필터링
            .map(skill => {
              const config = DEFINED_SKILLS_CONFIG[skill.name];
              return {
                name: config.displayName || skill.name,
                count: skill.count,
                color: '', // 사용되지 않음
                gradientFrom: config.gradientFrom,
                gradientTo: config.gradientTo,
                icon: config.icon,
              };
            })
            .sort((a, b) => b.count - a.count); // 카운트 기준으로 내림차순 정렬

          setSkillsData(processedSkills);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('API 호출 중 오류가 발생했습니다.');
        console.error('Error fetching skills data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSkillsData();
  }, []);

  // 전체 포스트 수 계산
  const totalSkillPosts = skillsData.reduce((sum, skill) => sum + skill.count, 0);

  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <section className="scroll-mt-[80px] py-20 md:py-20 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 relative overflow-hidden m-10 rounded-3xl">
          <div className="container mx-auto px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-slate-700 rounded-2xl mx-auto mb-6"></div>
                <div className="w-48 h-8 bg-slate-700 rounded mx-auto mb-4"></div>
                <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mb-8"></div>
                <div className="w-64 h-4 bg-slate-700 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden">
        <section className="scroll-mt-[80px] py-20 md:py-20 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 relative overflow-hidden m-10 rounded-3xl">
          <div className="container mx-auto px-6 lg:px-8 relative">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code size={40} className="text-red-400" />
              </div>
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <section
        id="tech-stack-section"
        className="scroll-mt-[80px] py-20 md:py-20 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 relative overflow-hidden m-10 rounded-3xl"
      >
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
              <Zap size={32} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
              My Tech Stack
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              제가 주로 다루고 기록하는 기술들입니다. (게시물 수 기반)
            </p>
          </div>

          {skillsData.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {skillsData.map((skill, index) => (
                <div
                  key={skill.name}
                  className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 p-4 rounded-xl shadow-lg hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.01] opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${skill.gradientFrom} ${skill.gradientTo} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        {skill.icon || (
                          <Code size={16} className="text-white" />
                        )}
                      </div>
                      <span className="font-semibold text-lg text-white">
                        {skill.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-medium text-slate-300">
                        {skill.count} Posts
                      </div>
                      <div className="text-xs text-slate-500">
                        {totalSkillPosts > 0
                          ? Math.round((skill.count / totalSkillPosts) * 100)
                          : 0}
                        % of total
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className={`bg-gradient-to-r ${skill.gradientFrom} ${skill.gradientTo} h-4 rounded-full flex items-center justify-end pr-2 text-xs font-semibold text-white shadow-lg transition-all duration-1000 ease-out group-hover:shadow-lg`}
                        style={{
                          width: `${
                            totalSkillPosts > 0
                              ? Math.max(
                                  (skill.count / totalSkillPosts) * 100,
                                  8 // 최소 너비 8%
                                )
                              : 0
                          }%`,
                        }}
                      >
                        <span className="drop-shadow-sm">
                          {totalSkillPosts > 0
                            ? `${Math.round(
                                (skill.count / totalSkillPosts) * 100
                              )}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code size={40} className="text-slate-500" />
              </div>
              <p className="text-slate-500 text-lg">
                표시할 기술 스택 정보가 충분하지 않습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}