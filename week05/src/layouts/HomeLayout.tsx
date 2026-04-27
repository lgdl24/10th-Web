import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <div className="h-dvh flex flex-col">
      <nav>네비바임</nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer>푸터임</footer>
    </div>
  );
};

export default HomeLayout;
