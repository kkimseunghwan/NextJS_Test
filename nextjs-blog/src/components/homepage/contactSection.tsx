import { UserCircle, Code, Coffee, Sparkles } from "lucide-react";

export default function ContactSection() {
  return (
    <>
      {/* About 섹션 */}
      <section className="bg-black py-20 md:py-10 relative overflow-hidden ">
        <div className="container mx-auto px-6 lg:px-8 relative">
          {/* 헤더 왼쪽 정렬 */}
          <div className="mb-12 md:mb-7 pl-5">
            {" "}
            {/* text-center 제거 */}
            <div className="flex items-center gap-4 mb-3">
              <div>
                <h2 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Contact
                </h2>
                <div className="w-20 h-0.5 bg-gradient-to-r from-gray-600 to-blue-600 mt-2 rounded-full"></div>{" "}
              </div>
            </div>
          </div>
        </div>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="text-left mb-8">
            <p className="text-0.8xl text-slate-400 max-w-3xl pl-5 leading-relaxed">
              Email : rhian3493@gmail.com <br />
              Phone : 010-2391-xxxx <br />
              Github : github.com/kkimseunghwan Blog : https://
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
