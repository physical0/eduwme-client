import NavbarLogo from "@src/assets/nav-logo.svg";

const TopNavBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b-2 border-white/20 dark:border-white/10 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        {/* Hamburger Menu - Enhanced with gradient */}
        <button className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="w-6 sm:w-7 h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 transition-all duration-300 group-hover:scale-110"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              ></div>
            ))}
        </button>

        {/* Logo - Enhanced with glow effect */}
        <img
          src={NavbarLogo}
          alt="Logo"
          className="w-20 h-8 sm:w-24 sm:h-10 md:w-28 md:h-12 drop-shadow-lg hover:scale-105 transition-transform duration-300"
        />

        {/* Spacer for balance */}
        <div className="w-10 sm:w-12"></div>
      </div>
    </div>
  );
};

export default TopNavBar;
