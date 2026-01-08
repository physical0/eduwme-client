import { useState } from "react";
import { Link } from "react-router-dom";

// Mock data interfaces
interface CourseBatch {
    courseBatchId: string;
    stage: number;
    coursesLength: number;
    isUnlocked: boolean;
}

interface Course {
    courseId: string;
    title: string;
    icon: string;
    status: "not_started" | "in_progress" | "completed";
    completionPercentage?: number;
}

const TrialHome = () => {
    // Mock user stats
    const mockUserStats = {
        gems: 285,
        xp: 1240,
    };

    // Mock course batches with courses
    const mockCourseBatches: CourseBatch[] = [
        { courseBatchId: "batch-1", stage: 1, coursesLength: 6, isUnlocked: true },
        { courseBatchId: "batch-2", stage: 2, coursesLength: 6, isUnlocked: true },
        { courseBatchId: "batch-3", stage: 3, coursesLength: 4, isUnlocked: false },
    ];

    // Mock courses for Stage 1
    const stage1Courses: Course[] = [
        { courseId: "c1", title: "Basic Addition", icon: "➕", status: "completed", completionPercentage: 100 },
        { courseId: "c2", title: "Basic Subtraction", icon: "➖", status: "completed", completionPercentage: 100 },
        { courseId: "c3", title: "Number Patterns", icon: "🔢", status: "in_progress", completionPercentage: 65 },
        { courseId: "c4", title: "Counting Skills", icon: "🔢", status: "in_progress", completionPercentage: 40 },
        { courseId: "c5", title: "Simple Fractions", icon: "🧮", status: "not_started" },
        { courseId: "c6", title: "Intro to Geometry", icon: "📐", status: "not_started" },
    ];

    // Mock courses for Stage 2
    const stage2Courses: Course[] = [
        { courseId: "c7", title: "Advanced Addition", icon: "➕", status: "completed", completionPercentage: 100 },
        { courseId: "c8", title: "Multiplication Basics", icon: "✖️", status: "in_progress", completionPercentage: 50 },
        { courseId: "c9", title: "Division Concepts", icon: "➗", status: "not_started" },
        { courseId: "c10", title: "Percentage Basics", icon: "📊", status: "not_started" },
        { courseId: "c11", title: "Algebraic Thinking", icon: "🔣", status: "not_started" },
        { courseId: "c12", title: "Word Problems", icon: "📚", status: "not_started" },
    ];

    // Mock courses for Stage 3 (locked)
    const stage3Courses: Course[] = [
        { courseId: "c13", title: "Advanced Multiplication", icon: "✖️", status: "not_started" },
        { courseId: "c14", title: "Advanced Division", icon: "➗", status: "not_started" },
        { courseId: "c15", title: "Complex Fractions", icon: "🧮", status: "not_started" },
        { courseId: "c16", title: "Geometry Advanced", icon: "📐", status: "not_started" },
    ];

    const coursesByBatch: { [key: string]: Course[] } = {
        "batch-1": stage1Courses,
        "batch-2": stage2Courses,
        "batch-3": stage3Courses,
    };

    const [showDemoAlert, setShowDemoAlert] = useState(false);

    const handleCourseClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowDemoAlert(true);
        setTimeout(() => setShowDemoAlert(false), 3000);
    };

    const ButtonStyle = `
    w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16
    p-1.5 sm:p-2 
    relative overflow-hidden
    flex flex-col justify-center items-center 
    rounded-xl sm:rounded-2xl md:rounded-2xl
    bg-white/80 dark:bg-gray-800/60
    backdrop-blur-md
    border md:border-2 border-white/40 dark:border-gray-700/40
    shadow-md hover:shadow-lg
    text-sm sm:text-base md:text-lg lg:text-lg 
    gap-0.5
    transition-all duration-300 ease-out
    hover:scale-105 hover:-translate-y-0.5
    group
    card-lift
  `;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 pt-2 sm:pt-4">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-2 pb-16">

                {/* Demo Mode Banner */}
                <div className="mb-4 sm:mb-6 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 border-cyan-400/50 dark:border-cyan-500/50 fade-in-stagger">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg animate-cyan-wave">
                                <span className="text-xl sm:text-2xl">👁️</span>
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base md:text-lg font-bold gradient-text">Demo Mode</h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">You're viewing a preview of EduWMe</p>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <Link
                                to="/register"
                                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl
                  bg-gradient-to-r from-green-500 to-emerald-600
                  hover:from-green-600 hover:to-emerald-700
                  text-white shadow-lg hover:shadow-xl transition-all duration-300
                  transform hover:scale-105"
                            >
                                Sign Up Free
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl
                  glass-card border-2 border-gray-300 dark:border-gray-600
                  hover:border-cyan-400 dark:hover:border-cyan-500
                  transition-all duration-300 transform hover:scale-105"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Demo Alert */}
                {showDemoAlert && (
                    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 glass-card px-6 py-4 rounded-xl shadow-2xl border-2 border-yellow-400/50 dark:border-yellow-500/50 fade-in-stagger">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">This is a demo!</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sign up to access full courses</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Stats Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                        Learning Areas
                    </h1>

                    <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                        {/* Gems badge */}
                        <div className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                            <span className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">💎</span>
                            <span className="font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                {mockUserStats.gems}
                            </span>
                        </div>

                        {/* XP badge */}
                        <div className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                            <span className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">🏅</span>
                            <span className="font-bold text-xs sm:text-sm bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                                {mockUserStats.xp} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Educational News - Mock */}
                <div className="mb-3 sm:mb-4 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 border-white/20 dark:border-white/10 fade-in-stagger">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl sm:text-2xl">📰</span>
                        <h2 className="text-sm sm:text-base md:text-lg font-bold gradient-text">Educational Tip</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Practice makes perfect! Complete exercises daily to build strong math foundations. 🚀
                    </p>
                </div>

                {/* Course Batches */}
                {mockCourseBatches.map((batch, batchIndex) => {
                    const courses = coursesByBatch[batch.courseBatchId];
                    const completedCount = courses.filter(c => c.status === "completed").length;

                    return (
                        <div
                            key={batch.courseBatchId}
                            className="mb-4 sm:mb-5 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-500 fade-in-stagger border-2 border-white/20 dark:border-white/10"
                            style={{ animationDelay: `${batchIndex * 100}ms` }}
                        >
                            {/* Batch Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 pb-2 border-b-2 border-gradient-to-r from-purple-500/20 to-blue-500/20">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold gradient-text">
                                        Stage {batch.stage}
                                    </h2>

                                    {!batch.isUnlocked && (
                                        <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1">
                                            <span className="text-sm sm:text-base">🔒</span>
                                            Locked
                                        </span>
                                    )}

                                    {batch.isUnlocked && (
                                        <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1">
                                            <span className="text-sm sm:text-base">🔓</span>
                                            Unlocked
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {batch.isUnlocked && (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-24 sm:w-32 md:w-40 bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2 sm:h-2.5 md:h-3 backdrop-blur-sm border border-white/20">
                                            <div
                                                className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg animate-cyan-wave"
                                                style={{
                                                    width: `${batch.coursesLength > 0 ? (completedCount / batch.coursesLength) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-xs sm:text-sm md:text-base font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent">
                                            {completedCount}/{batch.coursesLength}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Locked Message */}
                            {!batch.isUnlocked && (
                                <div className="glass-card rounded-xl md:rounded-xl p-4 sm:p-5 md:p-4 text-center border border-gray-300/20 dark:border-gray-600/20">
                                    <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium">
                                        🎯 Complete previous stages to unlock this learning area
                                    </p>
                                </div>
                            )}

                            {/* Course Grid */}
                            {batch.isUnlocked && (
                                <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
                                    {courses.map((course, courseIndex) => {
                                        const isCompleted = course.status === "completed";
                                        const isInProgress = course.status === "in_progress" && !isCompleted;

                                        return (
                                            <div
                                                key={course.courseId}
                                                className="flex flex-col items-center text-center fade-in-stagger"
                                                style={{ animationDelay: `${(batchIndex * 100) + (courseIndex * 50)}ms` }}
                                            >
                                                {/* Completion Checkmark */}
                                                {isCompleted && (
                                                    <span className="absolute -top-1 right-2 sm:-top-1.5 sm:right-2 md:-top-2 md:right-2 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-xs sm:text-sm rounded-full p-1 sm:p-1.5 leading-none flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 z-20 shadow-lg animate-bounce">
                                                        ✓
                                                    </span>
                                                )}

                                                {/* Course Button */}
                                                <button
                                                    onClick={handleCourseClick}
                                                    className={`${ButtonStyle} relative shimmer`}
                                                >
                                                    {/* Gradient Background Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-400/0 group-hover:from-cyan-500/20 group-hover:to-cyan-400/20 rounded-2xl md:rounded-3xl transition-all duration-300"></div>

                                                    {/* Progress Circle */}
                                                    <div className="absolute inset-0 w-full h-full">
                                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                                            {(isInProgress || isCompleted) && (
                                                                <>
                                                                    <circle
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="46"
                                                                        fill="none"
                                                                        stroke="#e5e7eb"
                                                                        strokeWidth="3"
                                                                        className="dark:opacity-20"
                                                                    />
                                                                    <defs>
                                                                        <linearGradient id={`gradient-${course.courseId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                                            <stop offset="0%" stopColor={isCompleted ? "#10b981" : "#22d3ee"} />
                                                                            <stop offset="100%" stopColor={isCompleted ? "#059669" : "#06b6d4"} />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <circle
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="46"
                                                                        fill="none"
                                                                        stroke={`url(#gradient-${course.courseId})`}
                                                                        strokeWidth="3"
                                                                        strokeDasharray="289.5"
                                                                        strokeDashoffset={
                                                                            isCompleted
                                                                                ? "0"
                                                                                : course.completionPercentage
                                                                                    ? `${289.5 * (1 - course.completionPercentage / 100)}`
                                                                                    : "144.75"
                                                                        }
                                                                        transform="rotate(-90 50 50)"
                                                                        strokeLinecap="round"
                                                                        className="transition-all duration-700 ease-out drop-shadow-lg"
                                                                    />
                                                                </>
                                                            )}
                                                        </svg>
                                                    </div>

                                                    {/* Course Icon */}
                                                    <span
                                                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl z-10 relative group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                                                    >
                                                        {course.icon}
                                                    </span>
                                                </button>

                                                {/* Course Title */}
                                                <p className="mt-1.5 sm:mt-2 md:mt-3 font-semibold text-xs xs:text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-100 line-clamp-2 w-full">
                                                    {course.title}
                                                </p>

                                                {/* Status Badges */}
                                                {isCompleted && (
                                                    <span className="mt-1 inline-block px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold shadow-md">
                                                        Completed
                                                    </span>
                                                )}

                                                {isInProgress && (
                                                    <span className="mt-1 inline-block px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold shadow-md animate-cyan-wave">
                                                        In Progress
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Bottom CTA */}
                <div className="mt-8 glass-card rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-purple-400/30 dark:border-purple-500/30 text-center fade-in-stagger">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-3">
                        Love what you see?
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6 max-w-xl mx-auto">
                        Create a free account to unlock all courses, track your real progress, and compete on the leaderboard!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-3 text-base sm:text-lg font-bold rounded-xl
                bg-gradient-to-r from-purple-500 to-indigo-600
                hover:from-purple-600 hover:to-indigo-700
                text-white shadow-lg hover:shadow-2xl transition-all duration-300
                transform hover:scale-105 shimmer"
                        >
                            Get Started Free →
                        </Link>
                        <Link
                            to="/trialApp"
                            className="px-8 py-3 text-base sm:text-lg font-semibold rounded-xl
                glass-card border-2 border-gray-300 dark:border-gray-600
                hover:border-purple-400 dark:hover:border-purple-500
                transition-all duration-300 transform hover:scale-105"
                        >
                            ← Back to Info
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrialHome;
