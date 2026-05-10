import { Link } from "react-router-dom";
import {
  IoSearchOutline,
  IoPersonOutline,
  IoCloseOutline,
} from "react-icons/io5";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* 딤처리 - 항상 표시 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={onClose}
        />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={`
          fixed top-0 left-0 h-full
          w-64 bg-black text-white z-20
          flex flex-col gap-6 p-6
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 닫기 버튼 - 항상 표시 */}
        <button onClick={onClose} className="self-end">
          <IoCloseOutline size={28} />
        </button>

        <nav className="flex flex-col gap-6">
          <Link
            to="/search"
            onClick={onClose}
            className="flex items-center gap-3 text-white"
          >
            <IoSearchOutline size={24} />
            <span>찾기</span>
          </Link>

          <Link
            to="/my"
            onClick={onClose}
            className="flex items-center gap-3 text-white"
          >
            <IoPersonOutline size={24} />
            <span>마이페이지</span>
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
