import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import AdditionIcon from "@src/assets/additionIcon.svg";
import { useAuth } from "../../contexts/AuthContext";
import EducationalNews from "@src/components/EducationalNews";
import LoadingPage from "@src/components/loading";

// Define types for course batches
interface CourseBatch {
  courseBatchId: string;
  dateCreated: string;
  courseList: string[]; // Array of courseId strings
  stage: number;
  coursesLength: number; // Total number of courses defined in this batch's courseList
  isUnlocked?: boolean;
}

// Define types for courses
interface Course {
  courseBatchId: string; // The batch this course primarily belongs to (can be in multiple)
  courseId: string;
  title: string;
  level: number;
  dateCreated: string;
  exerciseBatchList: string[];
  exercisesLength: number;
  logo: string;
}

interface CourseIcon {
  icon: string | typeof AdditionIcon; // Can be string emoji or imported SVG
  size?: {
    xs?: string; // Custom size for extra small screens
    sm?: string; // Custom size for small screens
    md?: string; // Custom size for medium screens
    lg?: string; // Custom size for large screens
  };
}

// Define types for API responses
interface CourseBatchResponse {
  message: string;
  courseBatchList: CourseBatch[];
}

interface CourseResponse {
  message: string;
  courseList: Course[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
}

// Define types for user progress
// This interface should match the structure of your user's progress data
interface CourseProgressDetail {
  courseId: string;
  status: "not_started" | "in_progress" | "completed";
  completionPercentage?: number; // Added for progress tracking
  // Add other course-specific progress details if needed
}

interface UserProgress {
  courseBatchId: string;
  status: "not_started" | "in_progress" | "completed";
  completedCoursesCount: number;
  totalCoursesInBatch: number; // This should ideally match batch.coursesLength
  courses?: CourseProgressDetail[]; // Array of progress for individual courses within the batch
}

// Enhanced ButtonStyle with modern glassmorphism and gradient effects
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



const getIconForCourse = (title: string): CourseIcon => {
  // Normalize the title to lowercase for more reliable matching
  const normalizedTitle = title.toLowerCase().trim();

  if (normalizedTitle.includes('addition')) {
    return {
      icon: "➕",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('subtraction')) {
    return {
      icon: "➖",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('multiplication')) {
    return {
      icon: "✖️",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('division')) {
    return {
      icon: "➗",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else if (normalizedTitle.includes('fraction')) {
    return {
      icon: "🧮",
      size: { xs: "text-xl", sm: "text-2xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('number') || normalizedTitle.includes('counting')) {
    return {
      icon: "🔢",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('geometry')) {
    return {
      icon: "📐",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('graph')) {
    return {
      icon: "📊",
      size: { xs: "text-xl", sm: "text-2xl", md: "text-3xl", lg: "text-4xl" }
    };
  } else if (normalizedTitle.includes('algebra')) {
    return {
      icon: "🔣",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-4xl", lg: "text-5xl" }
    };
  } else {
    return {
      icon: "📚",
      size: { xs: "text-2xl", sm: "text-3xl", md: "text-3xl", lg: "text-4xl" }
    };
  }
};

const Home = () => {
  const [courseBatches, setCourseBatches] = useState<CourseBatch[]>([]);
  const [courses, setCourses] = useState<{ [courseId: string]: Course }>({}); // Store all fetched courses by their ID for easy lookup
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getAuthHeader } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentUserProgress: UserProgress[] = [];
        console.log("User data fetched successfully:", user);

        if (user) {
          const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
            credentials: "include",
            headers: await getAuthHeader()
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Fixed: userData directly contains the user object, not nested under a "user" property
            if (userData.courseBatchesProgress) {
              currentUserProgress = userData.courseBatchesProgress;
              setUserProgress(currentUserProgress);
            }
          } else {
            console.error("Failed to fetch user data, status:", userResponse.status);
            // Potentially set an error or handle anonymous users differently
          }
        }

        const courseBatchesResponse = await fetch(
          `${API_BASE_URL}/courses/getCourseBatches`,
          {
            credentials: "include",
            headers: await getAuthHeader(),
          }
        );

        if (!courseBatchesResponse.ok) {
          throw new Error(`HTTP error fetching course batches! status: ${courseBatchesResponse.status}`);
        }

        const courseBatchesData: CourseBatchResponse = await courseBatchesResponse.json();
        const sortedBatches = courseBatchesData.courseBatchList.sort((a, b) => a.stage - b.stage);

        const batchesWithUnlockState = sortedBatches.map((batch, index) => {
          if (index === 0) {
            return { ...batch, isUnlocked: true };
          }
          const previousBatch = sortedBatches[index - 1];
          const previousBatchProgress = currentUserProgress.find(
            p => p.courseBatchId === previousBatch.courseBatchId
          );
          const isUnlocked = previousBatchProgress?.status === "completed";
          return { ...batch, isUnlocked };
        });

        setCourseBatches(batchesWithUnlockState);

        // Fetch all courses referenced in any batch's courseList
        const allReferencedCourseIds = new Set<string>();
        batchesWithUnlockState.forEach(batch => {
          batch.courseList.forEach(courseId => allReferencedCourseIds.add(courseId));
        });

        const fetchedCoursesMap: { [courseId: string]: Course } = {};
        if (allReferencedCourseIds.size > 0) {
          // Assuming an endpoint that can fetch multiple courses by IDs,
          // or fetching them one by one if necessary.
          // For simplicity, if /getCourses can take a list of IDs or if we fetch all and filter:
          // This example assumes /getCourses without params fetches ALL courses.
          // Adjust if your API behaves differently.
          const allCoursesResponse = await fetch(
            `${API_BASE_URL}/courses/getCourses`, // Potentially add query params if API supports fetching specific IDs
            {
              credentials: "include",
              headers: await getAuthHeader()
            }
          );
          if (!allCoursesResponse.ok) {
            throw new Error(`Failed to fetch all courses: ${allCoursesResponse.status}`);
          }
          const allCoursesData: CourseResponse = await allCoursesResponse.json();
          allCoursesData.courseList.forEach(course => {
            fetchedCoursesMap[course.courseId] = course;
          });
        }
        setCourses(fetchedCoursesMap);

      } catch (err) {
        console.error("Error in fetchAllData:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // Updated loading state with responsive spacing and text size
  if (loading) {
    return <LoadingPage message="Loading courses..." fullScreen={false} />;
  }

  // Updated error state with responsive layout and dark mode support
  if (error) {
    return (
      <div className="gap-4 md:gap-5 flex flex-col mt-12 md:mt-20 items-center justify-center">
        <p className="text-base md:text-lg text-red-600 dark:text-red-400">Error: {error}</p>
        {/* Enhanced button with better responsive padding and dark mode */}
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    // Main container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 pt-2 sm:pt-4">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-2 pb-16">

        {/* Enhanced user stats section with glassmorphism */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          {/* Gradient heading */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
            Learning Areas
          </h1>

          {/* Enhanced user stats badges with glassmorphism */}
          <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
            {/* Gems badge with glow effect */}
            <div className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group">
              <span className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">💎</span>
              <span className="font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {user?.gems || 0}
              </span>
            </div>

            {/* XP badge with glow effect */}
            <div className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group">
              <span className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">🏅</span>
              <span className="font-bold text-xs sm:text-sm bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                {user?.xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 mb-3 sm:mb-4">
          <EducationalNews />
        </div>

        {/* Map through course batches with enhanced styling */}
        {courseBatches.map((batch, batchIndex) => {
          const batchProgress = userProgress.find(p => p.courseBatchId === batch.courseBatchId);

          const orderedCoursesToShow = batch.courseList
            .map(courseIdFromList => courses[courseIdFromList])
            .filter(course => course !== undefined);

          return (
            // Enhanced batch container with glassmorphism
            <div
              key={batch.courseBatchId}
              className="mb-4 sm:mb-5 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-500 fade-in-stagger border-2 border-white/20 dark:border-white/10"
              style={{ animationDelay: `${batchIndex * 100}ms` }}
            >
              {/* Enhanced batch header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 pb-2 border-b-2 border-gradient-to-r from-purple-500/20 to-blue-500/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Gradient stage heading */}
                  <h2 className="text-base sm:text-lg md:text-xl font-bold gradient-text">
                    Stage {batch.stage}
                  </h2>

                  {/* Enhanced lock/unlock badges */}
                  {!batch.isUnlocked && (
                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1">
                      <span className="text-sm sm:text-base">🔒</span>
                      Locked
                    </span>
                  )}

                  {batch.isUnlocked && (
                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1 shimmer">
                      <span className="text-sm sm:text-base">🔓</span>
                      Unlocked
                    </span>
                  )}
                </div>

                {/* Enhanced progress bar with gradient */}
                {batchProgress && batch.isUnlocked && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-24 sm:w-32 md:w-40 bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2 sm:h-2.5 md:h-3 backdrop-blur-sm border border-white/20">
                      <div
                        className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg animate-cyan-wave"
                        style={{
                          width: `${batch.coursesLength > 0 ? (batchProgress.completedCoursesCount / batch.coursesLength) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent">
                      {batchProgress.completedCoursesCount}/{batch.coursesLength}
                    </span>
                  </div>
                )}
              </div>

              {/* Locked message with enhanced styling */}
              {!batch.isUnlocked && (
                <div className="glass-card rounded-xl md:rounded-xl p-4 sm:p-5 md:p-4 text-center border border-gray-300/20 dark:border-gray-600/20">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium">
                    🎯 Complete previous stages to unlock this learning area
                  </p>
                </div>
              )}

              {/* Enhanced course grid - adjusted columns */}
              {batch.isUnlocked && (
                <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
                  {orderedCoursesToShow.map((course, courseIndex) => {
                    const courseSpecificProgress = batchProgress?.courses?.find(c => c.courseId === course.courseId);
                    const isCompleted = courseSpecificProgress?.status === "completed";
                    const isInProgress = courseSpecificProgress?.status === "in_progress" && !isCompleted;

                    return (
                      <div
                        key={course.courseId}
                        className="flex flex-col items-center text-center fade-in-stagger"
                        style={{ animationDelay: `${(batchIndex * 100) + (courseIndex * 50)}ms` }}
                      >
                        {/* Enhanced course button with glassmorphism */}
                        <NavLink
                          to={`/courses/${course.courseId}`}
                          className={`${ButtonStyle} relative shimmer`}
                        >
                          {/* Gradient background overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-400/0 group-hover:from-cyan-500/20 group-hover:to-cyan-400/20 rounded-2xl md:rounded-3xl transition-all duration-300"></div>

                          {/* Enhanced circle progress indicator with gradient */}
                          <div className="absolute inset-0 w-full h-full">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              {(isInProgress || isCompleted) && (
                                <>
                                  {/* Background circle */}
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="46"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="3"
                                    className="dark:opacity-20"
                                  />
                                  {/* Gradient progress circle */}
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
                                        : courseSpecificProgress?.completionPercentage
                                          ? `${289.5 * (1 - courseSpecificProgress.completionPercentage / 100)}`
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


                          {/* Course icon with enhanced styling */}
                          {typeof getIconForCourse(course.title).icon === 'string' ? (
                            <span
                              role="img"
                              aria-label={`${course.title} icon`}
                              className={`
                                ${getIconForCourse(course.title).size?.xs || 'text-xl'} 
                                sm:${getIconForCourse(course.title).size?.sm || 'text-2xl'} 
                                md:${getIconForCourse(course.title).size?.md || 'text-3xl'} 
                                lg:${getIconForCourse(course.title).size?.lg || 'text-4xl'} 
                                z-10 relative
                                group-hover:scale-110 transition-transform duration-300
                                drop-shadow-lg
                              `}
                            >
                              {getIconForCourse(course.title).icon}
                            </span>
                          ) : (
                            <img
                              src={getIconForCourse(course.title).icon}
                              alt={`${course.title} icon`}
                              className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 z-10 relative group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                            />
                          )}

                          {/* Enhanced completion checkmark badge */}
                          {isCompleted && (
                            <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 md:-top-2 md:-right-2 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-xs sm:text-sm rounded-full p-1 sm:p-1.5 leading-none flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 z-20 shadow-lg animate-bounce">
                              ✓
                            </span>
                          )}
                        </NavLink>

                        {/* Enhanced course title */}
                        <p className="mt-1.5 sm:mt-2 md:mt-3 font-semibold text-xs xs:text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-100 line-clamp-2 w-full">
                          {course.title}
                        </p>

                        {/* Enhanced in progress badge */}
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

              {/* Enhanced empty message */}
              {batch.isUnlocked && orderedCoursesToShow.length === 0 && (
                <div className="glass-card rounded-xl md:rounded-xl p-4 sm:p-5 md:p-4 text-center border border-yellow-300/20 dark:border-yellow-600/20">
                  <p className="text-sm sm:text-base md:text-lg text-yellow-700 dark:text-yellow-400 font-medium">
                    📚 No courses available in this learning area yet
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Enhanced empty state message */}
        {courseBatches.length === 0 && !loading && (
          <div className="glass-card rounded-2xl md:rounded-2xl p-6 sm:p-8 md:p-8 text-center border-2 border-blue-300/20 dark:border-blue-600/20">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold gradient-text">
              🎓 No learning areas available yet. Check back soon!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;