// src/app/page.tsx
import MainSection from "@/components/homepage/MainSection";
import AboutSection from "@/components/homepage/AboutSection";
import TechStackSection from "@/components/homepage/TechStackSection";
// import LatestPostsSection from "@/components/homepage/LatestPostsSection";
import ContactSection from "@/components/homepage/contactSection";


export default async function HomePage() {


  return (
    <>
      <MainSection />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 via-slate-800 to-slate-900">
        <AboutSection />
        {/* skillsForTechStackSection 데이터가 */}
        <TechStackSection />

      </div>
      <ContactSection />
    </>
  );
}
