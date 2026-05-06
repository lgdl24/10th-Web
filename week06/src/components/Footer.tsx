const Footer = () => {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-zinc-400 flex flex-col md:flex-row justify-between items-center gap-2">
        {/* 왼쪽 */}
        <div>© {new Date().getFullYear()} MyApp. All rights reserved.</div>

        {/* 오른쪽 */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">
            이용약관
          </a>
          <a href="#" className="hover:text-white transition-colors">
            개인정보처리방침
          </a>
          <a href="#" className="hover:text-white transition-colors">
            문의
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
