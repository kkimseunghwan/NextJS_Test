import { Code, Zap } from "lucide-react"; // 필요한 아이콘 임포트

interface SkillData {
  name: string;
  count: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon?: React.ReactNode;
}

interface TechStackSectionProps {
  skillsData: SkillData[];
  totalSkillPosts: number;
}

export default function TechStackSection({
  skillsData,
  totalSkillPosts,
}: TechStackSectionProps) {
  return (
    <>
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
                    className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 p-4 rounded-xl shadow-lg hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      // 만약fadeInUp 같은 애니메이션을 추가하려면 globals.css에 정의하고 여기에 클래스 추가
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
      </div>
    </>
  );
}
