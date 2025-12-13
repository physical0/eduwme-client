import TopNavbar from "../components/topnav";
import BottomNavbar from "../components/bottomnav";
import SideNavbar from "../components/sidenav";
import { Outlet } from "react-router";
import { useSideNav } from "../contexts/SideNavContext";


const MainLayout = () => {
  const { isCollapsed } = useSideNav();

  return (
    <div className='min-h-screen transition-colors duration-300 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 bg-gradient-to-b from-[#E0E7FF] to-[#EAEAFF]'>
      <TopNavbar />

      {/* Side navigation - only visible on md screens and up */}
      <div className="hidden md:block">
        <SideNavbar />
      </div>

      {/* Main content - with dynamic padding based on collapse state */}
      <main className={`pt-24 pb-24 md:pt-20 md:pb-6 px-4 transition-all duration-300 ${isCollapsed ? 'md:pl-4' : 'md:pl-24 lg:pl-28 xl:pl-32'
        }`}>
        <Outlet />
      </main>

      {/* Bottom navigation - only visible on smaller screens */}
      <div className="block md:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default MainLayout;