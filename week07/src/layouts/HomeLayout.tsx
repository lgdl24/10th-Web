import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import FloatingButton from "../components/FloatingButton";

/** Tailwind의 md 브레이크포인트와 동일 */
const MD_BREAKPOINT = 768;

const HomeLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 창이 md 미만으로 작아지면 사이드바 자동 닫힘
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MD_BREAKPOINT) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-zinc-950">
      {/* 햄버거 클릭 시 토글 (open ↔ close) */}
      <Navbar onMenuClick={() => setIsOpen((prev) => !prev)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <Outlet />
        </main>
      </div>

      <Footer />
      <FloatingButton />
    </div>
  );
};

export default HomeLayout;
