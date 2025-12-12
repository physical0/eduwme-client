import { NavLink } from "react-router-dom";
import TrophyIcon from "@src/assets/trophy.svg";
import HomeIcon from "@src/assets/home.svg";
import ProfileIcon from "@src/assets/profile.svg";
import SettingsIcon from "@src/assets/settings.svg";
import ShopIcon from "@src/assets/store.svg";
import { useAuth } from "@src/contexts/AuthContext";

const SideNavBar = () => {
  const { user } = useAuth();

  const profileLink = `/profile/${user?._id}`;

  return (
    <nav className="fixed left-0 top-0 h-full pt-20 pb-8 w-20 md:w-24 lg:w-28 glass-card border-r-2 border-white/20 dark:border-white/10 shadow-2xl z-10 backdrop-blur-xl">
      <div className="h-full flex flex-col justify-start">
        <ul className="flex flex-col items-center gap-6 md:gap-8">
          {/* Home Link */}
          <li className="w-full flex justify-center">
            <NavLink to="/home">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-14 md:w-16 py-2.5 md:py-3 px-2 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105"
                  }`}>
                  <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    <img
                      src={HomeIcon}
                      className={`w-7 md:w-8 lg:w-9 mx-auto transition-all duration-300 ${isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md"
                        }`}
                      alt="Home"
                    />
                    <span className="text-[10px] md:text-xs mt-1 font-semibold text-center block">Home</span>
                  </div>
                  {/* Enhanced progress indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 shadow-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          </li>

          {/* Leaderboard Link */}
          <li className="w-full flex justify-center">
            <NavLink to="/leaderboard">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-14 md:w-16 py-2.5 md:py-3 px-2 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105"
                  }`}>
                  <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    <img
                      src={TrophyIcon}
                      className={`w-7 md:w-8 lg:w-9 mx-auto transition-all duration-300 ${isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md"
                        }`}
                      alt="Leaderboard"
                    />
                    <span className="text-[10px] md:text-xs mt-1 font-semibold text-center block">Ranks</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 shadow-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          </li>

          {/* Profile Link */}
          <li className="w-full flex justify-center">
            <NavLink to={profileLink}>
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-14 md:w-16 py-2.5 md:py-3 px-2 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105"
                  }`}>
                  <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    <img
                      src={ProfileIcon}
                      className={`w-7 md:w-8 lg:w-9 mx-auto transition-all duration-300 ${isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md"
                        }`}
                      alt="Profile"
                    />
                    <span className="text-[10px] md:text-xs mt-1 font-semibold text-center block">Profile</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 shadow-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          </li>

          {/* Shop Link */}
          <li className="w-full flex justify-center">
            <NavLink to="/shop">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-14 md:w-16 py-2.5 md:py-3 px-2 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105"
                  }`}>
                  <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    <img
                      src={ShopIcon}
                      className={`w-9 md:w-10 lg:w-11 mx-auto transition-all duration-300 ${isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md"
                        }`}
                      alt="Shop"
                    />
                    <span className="text-[10px] md:text-xs mt-1 font-semibold text-center block">Shop</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 shadow-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          </li>

          {/* Settings Link */}
          <li className="w-full flex justify-center">
            <NavLink to="/settings">
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center w-14 md:w-16 py-2.5 md:py-3 px-2 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105"
                  }`}>
                  <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    <img
                      src={SettingsIcon}
                      className={`w-7 md:w-8 lg:w-9 mx-auto transition-all duration-300 ${isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md"
                        }`}
                      alt="Settings"
                    />
                    <span className="text-[10px] md:text-xs mt-1 font-semibold text-center block">Settings</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 shadow-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          </li>


          {/* Enhanced Streak display */}
          <li className="mt-auto w-full flex justify-center">
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl glass-card flex flex-col items-center justify-center group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              {/* Gradient ring around streak */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  {user?.streak || 0}
                </span>
                <span className="text-[9px] md:text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                  {user?.streak === 1 ? "day" : "days"}
                </span>
              </div>

              {/* Flame emoji for active streaks */}
              {(user?.streak || 0) > 0 && (
                <span className="absolute -top-1 -right-1 text-lg md:text-xl animate-bounce">
                  🔥
                </span>
              )}

              {/* Enhanced tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-36 md:w-40 glass-card shadow-2xl rounded-xl p-3 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-white/20 dark:border-white/10">
                <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                  {user?.lastLoginDate ?
                    `Last login: ${new Date(user.lastLoginDate).toLocaleDateString()}` :
                    'Start your streak by completing lessons daily!'}
                </p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rotate-45 border-r border-b border-white/20 dark:border-white/10"></div>
                </div>
              </div>
            </div>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default SideNavBar;