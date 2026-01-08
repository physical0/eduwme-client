import { NavLink } from "react-router-dom";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcon from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";
import SettingsIcon from "@src/assets/settings.svg";
import ShopIcon from "@src/assets/store.svg";
import { useAuth } from "@src/contexts/AuthContext";
import { useSideNav } from "@src/contexts/SideNavContext";

// Navigation item configuration for cleaner code
interface NavItem {
  to: string;
  icon: string;
  label: string;
  iconSize?: string;
  isEmoji?: boolean; // For emoji-based icons
}

const SideNavBar = () => {
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSideNav();

  const profileLink = `/profile/${user?._id}`;

  // Navigation items configuration
  const navItems: NavItem[] = [
    { to: "/home", icon: HomeIcon, label: "Home" },
    { to: "/battle", icon: "⚔️", label: "Battle", isEmoji: true },
    { to: "/leaderboard", icon: TrophyIcon, label: "Ranks" },
    { to: profileLink, icon: ProfileIcon, label: "Profile" },
    { to: "/shop", icon: ShopIcon, label: "Shop", iconSize: "w-7 md:w-8 lg:w-9" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  // Reusable NavItem component for cleaner rendering
  const NavItemComponent = ({ item }: { item: NavItem }) => (
    <li className="w-full px-2 md:px-3">
      <NavLink to={item.to} className="block">
        {({ isActive }) => (
          <div
            className={`
              relative flex items-center gap-3 px-3 py-2.5 md:py-3
              rounded-xl transition-all duration-300 ease-out group
              ${isActive
                ? "bg-gradient-to-r from-cyan-500/90 to-cyan-600/90 text-white shadow-lg shadow-cyan-500/25 dark:shadow-cyan-400/20"
                : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }
            `}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm" />
            )}

            {/* Icon container - fixed alignment */}
            <div className={`
              w-6 h-6 md:w-7 md:h-7 flex items-center justify-center flex-shrink-0
              transition-transform duration-300
              ${isActive ? "scale-105" : "group-hover:scale-105"}
            `}>
              {item.isEmoji ? (
                <span className={`text-xl md:text-2xl ${isActive ? "drop-shadow-sm" : ""}`}>
                  {item.icon}
                </span>
              ) : (
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`
                    ${item.iconSize || "w-6 h-6 md:w-7 md:h-7"}
                    object-contain
                    transition-all duration-300
                    ${isActive
                      ? "brightness-0 invert drop-shadow-sm"
                      : "opacity-90 contrast-125 group-hover:opacity-100"
                    }
                  `}
                />
              )}
            </div>

            {/* Label - with smooth expand/collapse */}
            <span
              className={`
                font-medium text-sm md:text-base whitespace-nowrap
                transition-all duration-300 overflow-hidden
                ${isCollapsed ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"}
              `}
            >
              {item.label}
            </span>

            {/* Hover glow effect for inactive items */}
            {!isActive && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 to-cyan-500/0 group-hover:from-cyan-400/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
            )}
          </div>
        )}
      </NavLink>
    </li>
  );

  return (
    <>
      {/* Side Navigation */}
      <nav
        className={`
          fixed left-0 top-0 h-full pt-16 pb-4
          glass-card border-r-2 border-white/20 dark:border-white/10
          shadow-2xl backdrop-blur-xl
          z-40 transition-all duration-300 ease-out
          ${isCollapsed
            ? "-translate-x-full md:translate-x-0 md:w-[72px]"
            : "translate-x-0 w-[72px] md:w-60"
          }
        `}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/30 via-transparent to-purple-50/20 dark:from-cyan-900/10 dark:to-purple-900/10 pointer-events-none" />

        {/* Toggle Button - Refined design */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-12 items-center justify-center
            bg-white dark:bg-gray-800 
            border border-gray-200/80 dark:border-gray-700/80
            rounded-r-lg shadow-md hover:shadow-lg
            transition-all duration-300 z-50
            hover:bg-gray-50 dark:hover:bg-gray-750
            group
          `}
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`
              w-3.5 h-3.5 text-gray-400 dark:text-gray-500
              group-hover:text-cyan-500 dark:group-hover:text-cyan-400
              transition-all duration-300
              ${isCollapsed ? "rotate-0" : "rotate-180"}
            `}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Navigation Content */}
        <div className="h-full flex flex-col pt-6 relative z-10">
          {/* Navigation Links */}
          <ul className="flex flex-col gap-1 md:gap-1.5">
            {navItems.map((item) => (
              <NavItemComponent key={item.to} item={item} />
            ))}
          </ul>

          {/* Divider */}
          <div className="mx-4 my-4 md:my-6 border-t border-gray-200/60 dark:border-gray-700/60" />

          {/* Streak Display - Refined */}
          <div className="mt-auto px-2 md:px-3 pb-2">
            <div
              className={`
                relative overflow-hidden
                rounded-xl p-3 md:p-4
                bg-gradient-to-br from-amber-50 to-orange-50 
                dark:from-amber-900/20 dark:to-orange-900/20
                border border-amber-200/50 dark:border-amber-700/30
                group cursor-default
                transition-all duration-300 hover:shadow-md hover:shadow-amber-200/30 dark:hover:shadow-amber-900/20
              `}
            >
              {/* Decorative gradient blob */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150" />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                {/* Flame icon with animation */}
                <div className="flex-shrink-0">
                  <span className={`
                    text-2xl md:text-3xl
                    ${(user?.streak || 0) > 0 ? "animate-pulse" : "grayscale opacity-50"}
                  `}>
                    🔥
                  </span>
                </div>

                {/* Stats - shown when expanded */}
                <div className={`
                  flex flex-col overflow-hidden transition-all duration-300
                  ${isCollapsed ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"}
                `}>
                  <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                    {user?.streak || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    day{(user?.streak || 0) !== 1 ? "s" : ""} streak
                  </span>
                </div>
              </div>

              {/* Tooltip - only shows when collapsed */}
              <div
                className={`
                  absolute left-full top-1/2 -translate-y-1/2 ml-3
                  px-3 py-2 rounded-lg
                  bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium
                  opacity-0 pointer-events-none whitespace-nowrap
                  transition-all duration-200 shadow-lg
                  ${isCollapsed ? "md:group-hover:opacity-100" : ""}
                `}
              >
                {user?.streak || 0} day{(user?.streak || 0) !== 1 ? "s" : ""} streak
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SideNavBar;