import NavbarLogo from "@src/assets/nav-logo.svg";

const TopNavBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b-2 border-white/20 dark:border-white/10 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        {/* Logo - Centered */}
        <img
          src={NavbarLogo}
          alt="Logo"
          className="w-20 h-8 sm:w-24 sm:h-10 md:w-28 md:h-12 drop-shadow-lg hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
};

export default TopNavBar;
