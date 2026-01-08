import { Link } from "react-router-dom";

const TrialApp = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

                {/* Hero Section */}
                <div className="text-center mb-12 sm:mb-16 md:mb-20 fade-in-stagger">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-4 sm:mb-6">
                            Welcome to EduWMe
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-2">
                            Gamified Learning Made Fun! 🎮📚
                        </p>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Master mathematics through interactive exercises, earn rewards, and track your progress in a beautifully designed learning environment.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
                        <Link
                            to="/trialHome"
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl
                bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-600 animate-cyan-wave
                hover:from-purple-600 hover:via-pink-600 hover:to-indigo-700
                text-white shadow-lg hover:shadow-2xl transition-all duration-300
                transform hover:scale-105 shimmer"
                        >
                            <div className="flex items-center gap-2 justify-center">
                                <span>Try the Demo</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </Link>
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl
                glass-card border-2 border-cyan-400/50 dark:border-cyan-500/50
                hover:border-cyan-500 dark:hover:border-cyan-400
                text-gray-800 dark:text-white shadow-lg hover:shadow-2xl transition-all duration-300
                transform hover:scale-105"
                        >
                            Sign Up for Free
                        </Link>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">
                            Login here
                        </Link>
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text text-center mb-8 sm:mb-12">
                        Why Choose EduWMe?
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Feature 1 */}
                        <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 dark:border-white/10 fade-in-stagger">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl sm:text-3xl">🎮</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2">Gamified Learning</h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Earn XP, collect gems, and unlock achievements as you master each concept.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '100ms' }}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl sm:text-3xl">📊</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2">Progress Tracking</h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Visual progress bars and completion badges help you see how far you've come.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '200ms' }}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl sm:text-3xl">✨</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2">Interactive Exercises</h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Engage with dynamic animations and multiple question types for better understanding.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '300ms' }}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl sm:text-3xl">🏆</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2">Leaderboards</h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Compete with friends and climb the rankings as you complete more courses.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '400ms' }}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl sm:text-3xl">🌙</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2">Dark Mode</h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Study comfortably day or night with our beautiful dark mode interface.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '500ms' }}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-2xl sm:text-3xl">📱</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold gradient-text mb-2">Responsive Design</h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                Learn on any device - desktop, tablet, or mobile with a seamless experience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Demo Preview Section */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border-2 border-white/20 dark:border-white/10 mb-12 sm:mb-16 fade-in-stagger">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text text-center mb-6 sm:mb-8">
                        Start Learning Today
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        {/* Sample Course Cards */}
                        <div className="glass-card p-4 rounded-xl text-center hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl mb-2">➕</div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">Addition</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl mb-2">➖</div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">Subtraction</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl mb-2">✖️</div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">Multiplication</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl mb-2">➗</div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">Division</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/trialHome"
                            className="inline-block px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl
                bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600
                hover:from-purple-600 hover:via-pink-600 hover:to-indigo-700
                text-white shadow-lg hover:shadow-2xl transition-all duration-300
                transform hover:scale-105 shimmer"
                        >
                            Explore the Demo →
                        </Link>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center glass-card rounded-2xl p-8 sm:p-10 shadow-xl border-2 border-cyan-400/30 dark:border-cyan-500/30">
                    <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                        Join thousands of students already using EduWMe to master mathematics in a fun, engaging way.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-3 text-lg font-bold rounded-xl
                bg-gradient-to-r from-green-500 to-emerald-600
                hover:from-green-600 hover:to-emerald-700
                text-white shadow-lg hover:shadow-2xl transition-all duration-300
                transform hover:scale-105"
                        >
                            Create Free Account
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-xl
                border-2 border-gray-300 dark:border-gray-600
                hover:border-cyan-400 dark:hover:border-cyan-500
                text-gray-800 dark:text-white transition-all duration-300
                transform hover:scale-105"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrialApp;