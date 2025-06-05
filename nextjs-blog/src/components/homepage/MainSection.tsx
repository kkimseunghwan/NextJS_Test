"use client"; // ScrollToSectionButton 등을 사용하므로 클라이언트 컴포넌트가 될 수 있음
// 또는 ScrollToSectionButton만 클라이언트로 두고 이 컴포넌트는 서버로 유지 가능

import Image from "next/image";
import TopNavbar from "@/components/layout/TopNavbar";
import ScrollToSectionButton from "@/components/homepage/ScrollToSectionButton";
import { ChevronDown, Github, Sparkles } from "lucide-react";

// HeroSection에서만 필요한 props가 있다면 여기에 정의
// interface HeroSectionProps {}

export default function HeroSection(/* props: HeroSectionProps */) {
  return (
    <>
      {/* 메인 히어로 섹션 */}
      <div className="relative flex flex-col h-screen text-white overflow-hidden">
        {/* 배경 이미지 */}
        <Image
          src="/images/home-bg.jpg"
          alt="메인 배경 이미지"
          fill
          objectFit="cover"
          quality={90}
          className="-z-20"
          priority
        />

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-slate-900/80 -z-10"></div>

        {/* 애니메이션 파티클 효과 */}
        <div className="absolute inset-0 -z-5">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-ping delay-700"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-pink-400/30 rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          {/* 상태 배지 */}
          <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border border-cyan-500/30 text-white text-sm font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider shadow-2xl">
              <Sparkles size={16} className="animate-pulse" />I Love What I Do
            </span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6">
            <span className="block bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Hello World !
            </span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mt-2 sm:mt-4 animate-pulse">
              Let's Get it, Developer!
            </span>
          </h1>

          {/* 서브 타이틀 */}
          <p className="mt-8 max-w-xl md:max-w-2xl text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed">
            코드로 세상을 탐험하고, 경험을 공유하며 함께 성장하는 공간입니다.
            <br />
            <span className="text-cyan-400 font-medium">
              제 블로그에 오신 것을 환영합니다!
            </span>
          </p>

          {/* CTA 버튼들 */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <ScrollToSectionButton
              targetId="about-section"
              buttonText="블로그 둘러보기"
            />
          </div>
        </div>
      </div>
    </>
  );
}
