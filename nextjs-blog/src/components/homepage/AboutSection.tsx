import { UserCircle, Code, Coffee, Sparkles } from "lucide-react";

export default function AboutSection() {
  return (
    <>
      {/* About 섹션 */}
      <section
        id="about-section"
        className="py-20 md:py-20 relative overflow-hidden"
      >
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <UserCircle size={32} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
              About DEV_CONG
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              꾸준히 배우고 기록하는 것을 즐기는 주니어 개발자입니다. <br />
              이 블로그는 저의 학습 과정과 생각들을 공유하는 공간입니다. <br />
              주로 Python, JavaScript, 웹 개발 관련 기술에 관심이 많습니다.
            </p>
          </div>

          {/* 특징 카드들 */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/70 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                지속적 학습
              </h3>
              <p className="text-slate-400">
                새로운 기술을 배우고 기록하며 성장합니다.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/70 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coffee size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                경험 공유
              </h3>
              <p className="text-slate-400">
                배운 것들을 정리하고 다른 개발자들과 나눕니다.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/70 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                함께 성장
              </h3>
              <p className="text-slate-400">
                커뮤니티와 함께 발전하는 개발자가 되고자 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
