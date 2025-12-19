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
      {/* Main content - with dynamic padding based on collapse state */}
      <main className={`pt-20 pb-20 md:pt-24 md:pb-8 px-4 transition-all duration-300 ${isCollapsed ? 'md:pl-24' : 'md:pl-72'
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