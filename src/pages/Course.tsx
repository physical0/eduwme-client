import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingPage from "@src/components/loading";

// Define interfaces for type safety
interface Exercise {
  exerciseId: string;
  courseId: string;
  courseBatchId: string;
  title: string;
  difficultyLevel: number;
  dateCreated: string;
  animType: string;
  type: string;
  question: string;
  options: string[];
  answer: string;
}

interface Course {
  courseBatchId: string;
  courseId: string;
  title: string;
  level: number;
  dateCreated: string;
  exerciseBatchList: string[];
  exercisesLength: number;
  logo?: string;
}

interface CourseProgress {
  exerciseId: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  lastAttempted?: Date;
}

interface BatchProgress {
  courseBatchId: string;
  courses: CourseProgressItem[];
}

interface CourseProgressItem {
  courseId: string;
  exercises: CourseProgress[];
}


const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exercisesByLevel, setExercisesByLevel] = useState<{ [key: number]: Exercise[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const { getAuthHeader } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch course details and then exercises
  useEffect(() => {
    const fetchCourseAndExercises = async () => {
      if (!courseId) return;

      try {
        // Step 1: Fetch course details
        const courseResponse = await fetch(
          `${API_BASE_URL}/courses/getCoursesById/${courseId}`,
          {
            credentials: "include",
            headers: await getAuthHeader()
          }
        );

        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course: ${courseResponse.status}`);
        }

        const courseData = await courseResponse.json();
        const fetchedCourse = courseData.course;
        setCourse(fetchedCourse);

        // Step 2: Fetch user progress for this course
        if (user) {
          const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
            credentials: "include",
            headers: await getAuthHeader()
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Fixed: userData directly contains the user object, not nested under a "user" property
            const batchProgress = userData.courseBatchesProgress?.find(
              (batch: BatchProgress) => batch.courseBatchId === fetchedCourse.courseBatchId
            );

            const currentCourseProgress = batchProgress?.courses?.find(
              (c: CourseProgressItem) => c.courseId === courseId
            );

            if (currentCourseProgress?.exercises) {
              setCourseProgress(currentCourseProgress.exercises);
            }
          }
        }

        // Step 3: Fetch exercises for this course
        const exercisePromises = fetchedCourse.exerciseBatchList.map(
          async (exerciseId: string) => {
            const exerciseResponse = await fetch(
              `${API_BASE_URL}/exercises/getExercise/${exerciseId}`,
              {
                credentials: "include",
                headers: await getAuthHeader()
              }
            );

            if (!exerciseResponse.ok) {
              console.warn(`Failed to fetch exercise ${exerciseId}`);
              return null;
            }

            const exerciseData = await exerciseResponse.json();
            return exerciseData.exercise;
          }
        );

        const fetchedExercises = (await Promise.all(exercisePromises)).filter(
          (exercise): exercise is Exercise => exercise !== null
        );

        // Step 4: Organize exercises by difficulty level
        setExercises(fetchedExercises);

        const groupedExercises: { [key: number]: Exercise[] } = {};
        fetchedExercises.forEach(exercise => {
          const level = exercise.difficultyLevel;
          if (!groupedExercises[level]) {
            groupedExercises[level] = [];
          }
          groupedExercises[level].push(exercise);
        });

        setExercisesByLevel(groupedExercises);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchCourseAndExercises();
  }, [courseId, user]);

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  // Loading state
  if (loading) {
    return <LoadingPage message="Loading course content..." fullScreen={false} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4">
        <p className="text-sm sm:text-base md:text-lg text-red-600 dark:text-red-400 mb-3 sm:mb-4 font-medium">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Course not found state
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4">
        <p className="text-sm sm:text-base md:text-lg text-yellow-600 dark:text-yellow-400 mb-3 sm:mb-4 font-medium">Course not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const completedCount = courseProgress.filter(p => p.status === "completed").length;
  const progressPercentage = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

  return (
    // Main container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-[100%] sm:max-w-[100%] md:max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-6 pb-20 sm:pb-24 md:pb-16">

        {/* Enhanced back button with glassmorphism */}
        <button
          onClick={() => navigate("/home")}
          className="group glass-card flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-xl sm:rounded-2xl
            shadow-lg hover:shadow-xl
            transition-all duration-300
            font-semibold text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-6
            hover:scale-105 hover:-translate-x-1"
          aria-label="Return to home page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform duration-200 text-purple-600 dark:text-purple-400"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          <span className="gradient-text">Back to Home</span>
        </button>

        {/* Enhanced course header with glassmorphism */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 shadow-xl border-2 border-white/20 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 md:gap-6">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1">
              {/* Enhanced course logo */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden glass-card p-1.5 sm:p-2 md:p-3 shadow-lg flex-shrink-0">
                {course.logo ? (
                  <img
                    src={course.logo}
                    alt={`${course.title} logo`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-xl relative overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>

                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Central icon */}
                    <svg
                      className="relative w-2/3 h-2/3 text-white drop-shadow-lg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {/* Gradient course title */}
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gradient-text mb-1 sm:mb-2">
                  {course.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                  Level {course.level} • {exercises.length} Exercises • {completedCount} completed
                </p>

                {/* Enhanced Auto Exercise button */}
                <button
                  onClick={() => navigate(`/auto-exercise/${courseId}`)}
                  className="group px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base font-semibold rounded-xl
                      bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 
                      hover:from-purple-600 hover:via-pink-600 hover:to-indigo-700
                      text-white shadow-lg hover:shadow-xl transition-all duration-300
                      transform hover:scale-105 shimmer"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Auto Exercise Mode
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced progress indicator */}
            <div className="glass-card p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-white/10 min-w-[120px] sm:min-w-[140px] md:min-w-[160px]">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">
                Progress
              </p>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto">
                {/* Circular progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35%"
                    fill="none"
                    stroke="url(#progress-gradient)"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(exercisesByLevel).length === 0 ? (
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center border-2 border-yellow-300/20 dark:border-yellow-600/20">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm sm:text-base md:text-lg font-semibold">
              📚 No exercises available for this course yet
            </p>
          </div>
        ) : (
          // Exercise levels with enhanced styling
          Object.entries(exercisesByLevel)
            .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
            .map(([level, levelExercises], levelIndex) => (
              <div key={level} className="mb-4 sm:mb-6 md:mb-8 fade-in-stagger" style={{ animationDelay: `${levelIndex * 100}ms` }}>
                {/* Enhanced level heading */}
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 md:mb-5 gradient-text flex items-center gap-2">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm sm:text-base shadow-lg">
                    {level}
                  </span>
                  Level {level} Exercises
                </h2>

                {/* Enhanced exercise grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {levelExercises.map((exercise, index) => {
                    // Find exercise progress
                    const exerciseProgress = courseProgress.find(
                      p => p.exerciseId === exercise.exerciseId
                    );

                    const isCompleted = exerciseProgress?.status === "completed";
                    const isInProgress = exerciseProgress?.status === "in_progress";

                    return (
                      <div
                        key={exercise.exerciseId}
                        onClick={() => handleExerciseClick(exercise.exerciseId)}
                        className={`
                          glass-card p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl cursor-pointer
                          transition-all duration-300 ease-out
                          hover:scale-105 hover:shadow-2xl
                          border-2
                          ${isCompleted
                            ? "border-green-400/50 dark:border-green-500/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20"
                            : isInProgress
                              ? "border-blue-400/50 dark:border-blue-500/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"
                              : "border-white/40 dark:border-white/20 hover:border-purple-400/50 dark:hover:border-purple-500/50"}
                          shimmer
                          fade-in-stagger
                        `}
                        style={{ animationDelay: `${(levelIndex * 100) + (index * 50)}ms` }}
                      >
                        {/* Exercise header */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          {/* Exercise number badge */}
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-bold shadow-lg">
                            {index + 1}
                          </div>

                          {/* Exercise title */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white line-clamp-1">
                              {exercise.title}
                            </h3>
                          </div>

                          {/* Completion indicator */}
                          {isCompleted && (
                            <span className="flex-shrink-0 text-green-500 dark:text-green-400 text-lg sm:text-xl md:text-2xl animate-bounce">
                              ✓
                            </span>
                          )}
                          {isInProgress && (
                            <span className="flex-shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                          )}
                        </div>

                        {/* Exercise metadata */}
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[9px] sm:text-[10px] md:text-xs font-semibold">
                            {exercise.type}
                          </span>
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[9px] sm:text-[10px] md:text-xs font-semibold">
                            {exercise.animType}
                          </span>
                        </div>

                        {/* Question preview */}
                        <div className="glass-card p-2 sm:p-2.5 md:p-3 rounded-lg border border-white/30 dark:border-white/10">
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {exercise.question}
                          </p>
                        </div>

                        {/* Status badge */}
                        {isCompleted && (
                          <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5">
                            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold shadow-md">
                              Completed
                            </span>
                            {exerciseProgress?.score !== undefined && (
                              <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold shadow-md">
                                {exerciseProgress.score}%
                              </span>
                            )}
                          </div>
                        )}
                        {isInProgress && (
                          <div className="mt-2 sm:mt-3 text-center">
                            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold shadow-md">
                              In Progress
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Course;