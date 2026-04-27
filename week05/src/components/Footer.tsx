const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t mt-10">
      <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-2">
        {/* 왼쪽 */}
        <div>© {new Date().getFullYear()} MyApp. All rights reserved.</div>

        {/* 오른쪽 */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-black">
            이용약관
          </a>
          <a href="#" className="hover:text-black">
            개인정보처리방침
          </a>
          <a href="#" className="hover:text-black">
            문의
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
