import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import ExerciseAnimation from "@src/components/ExerciseAnimation";
import LoadingPage from "@src/components/loading";


// Define interfaces for our data
interface ExerciseData {
  _id: string;
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

interface CompletionResult {
  message: string;
  awardedXp: number;
  currentXp: number;
  level: number;
  gems?: number;
  alreadyCompleted: boolean;
  exerciseStatus: {
    courseBatchId: string;
    courseId: string;
    exerciseId: string;
    status: string;
  };
  courseProgress: number;
}


interface ExerciseProgress {
  exerciseId: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  lastAttempted?: Date;
}

interface CourseProgressItem {
  courseId: string;
  status: "not_started" | "in_progress" | "completed";
  totalExercisesInCourse: number;
  completedExercisesCount: number;
  exercises: ExerciseProgress[];
}

interface BatchProgress {
  courseBatchId: string;
  status: "not_started" | "in_progress" | "completed";
  totalCoursesInBatch: number;
  completedCoursesCount: number;
  courses: CourseProgressItem[];
}

const AutoExercise = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [allExercises, setAllExercises] = useState<ExerciseData[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [currentExercise, setCurrentExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10); // 10 seconds timer
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [completionData, setCompletionData] = useState<CompletionResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [allCompleted, setAllCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { getAuthHeader } = useAuth();

  const MAX_TIME: number = 50;

  // Timer configuration - dynamic based on difficulty
  const timeLimit = useMemo(() => {
    // Base time: 60 seconds for level 1, decreasing by 10 seconds per level
    // Min time: 20 seconds for hardest exercises
    return Math.max(MAX_TIME - ((currentExercise?.difficultyLevel || 1) - 1) * 10, 20);
  }, [currentExercise?.difficultyLevel]);

  const timerRef = useRef<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch all exercises for the course
  const fetchCourseExercises = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);

      // Step 1: Fetch course details to get exerciseBatchList
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
      const course = courseData.course;

      // Step 2: Fetch exercises from the batch list
      const exercisePromises = course.exerciseBatchList.map(
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
        (exercise): exercise is ExerciseData => exercise !== null
      );

      setAllExercises(fetchedExercises);

      // Step 3: Get user progress to identify completed exercises
      if (user) {
        const userResponse = await fetch(`${API_BASE_URL}/users/getme`, {
          credentials: "include",
          headers: await getAuthHeader()
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const batchProgress = userData.courseBatchesProgress?.find(
            (batch: BatchProgress) => batch.courseBatchId === course.courseBatchId
          );

          const currentCourseProgress = batchProgress?.courses?.find(
            (c: CourseProgressItem) => c.courseId === courseId
          );

          if (currentCourseProgress?.exercises) {
            const completedExerciseIds = new Set<string>(
              currentCourseProgress.exercises
                .filter((ex: ExerciseProgress) => ex.status === "completed")
                .map((ex: ExerciseProgress) => ex.exerciseId as string)
            );
            setCompletedExercises(completedExerciseIds);

            // Update progress
            setProgress(completedExerciseIds.size / fetchedExercises.length);
          }
        }
      }

      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLoading(false);
    }
  }, [courseId, user, API_BASE_URL]);

  // Select a random uncompleted exercise
  const selectNextExercise = useCallback(() => {
    // Filter out completed exercises
    const remainingExercises = allExercises.filter(
      exercise => !completedExercises.has(exercise.exerciseId)
    );

    if (remainingExercises.length === 0) {
      // All exercises completed
      setAllCompleted(true);
      setCurrentExercise(null);
      return;
    }

    // Select a random exercise from remaining ones
    const randomIndex = Math.floor(Math.random() * remainingExercises.length);
    const selectedExercise = remainingExercises[randomIndex];

    // Reset exercise-specific state
    setCurrentExercise(selectedExercise);
    setSelectedOption(null);
    setTextAnswer("");
    setResult(null);
    setCompletionData(null);
    setShowResult(false);
    setTimeLeft(timeLimit);
    setIsTimerRunning(true);
  }, [allExercises, completedExercises, timeLimit]);

  // Initial fetch and setup
  useEffect(() => {
    fetchCourseExercises();

    return () => {
      // Clean up timer when component unmounts
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchCourseExercises]);

  // Select first exercise when data is loaded
  useEffect(() => {
    if (!loading && allExercises.length > 0 && !currentExercise) {
      selectNextExercise();
    }
  }, [loading, allExercises, currentExercise, selectNextExercise]);

  // Handle option selection
  const handleOptionSelect = useCallback((option: string) => {
    if (!isTimerRunning || result) return;
    setSelectedOption(option);
  }, [isTimerRunning, result]);

  // Handle text input for fill-in exercises
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTimerRunning || result) return;
    setTextAnswer(e.target.value);
  }, [isTimerRunning, result]);

  // Timer logic
  useEffect(() => {
    if (loading || !isTimerRunning || !currentExercise) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);

          // Time's up logic
          if (!result) {
            setResult({
              correct: false,
              message: "Time's up! You didn't answer in time."
            });
            setShowResult(true);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isTimerRunning, result, currentExercise]);

  // Submit answer
  const handleSubmitAnswer = useCallback(() => {
    if (!currentExercise || !isTimerRunning) return;

    // For multiple-choice, we need selectedOption. For fill-in, we need textAnswer
    if (currentExercise.type === 'multiple-choice' && !selectedOption) return;
    if (currentExercise.type === 'fill-in' && !textAnswer.trim()) return;

    // Stop the timer immediately to prevent multiple submissions
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const submitFn = async () => {
      const isCorrect = currentExercise.type === 'multiple-choice'
        ? selectedOption === currentExercise.answer
        : textAnswer.trim().toLowerCase() === currentExercise.answer.toLowerCase(); // Case insensitive comparison


      if (isCorrect) {
        // Correct answer within time limit
        try {
          if (!user) throw new Error("User not authenticated");

          const response = await fetch(
            `${API_BASE_URL}/courses/complete/${user._id}/${currentExercise.courseBatchId}/${currentExercise.courseId}/${currentExercise.exerciseId}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...(await getAuthHeader())
              }
            }
          );

          if (response.status === 429) {
            setResult({
              correct: true,
              message: "Correct! But we're experiencing high traffic. Your progress will be saved later."
            });
            setShowResult(true);
            return;
          }

          if (!response.ok) {
            throw new Error(`Failed to record completion: ${response.status}`);
          }

          const completionResult = await response.json();
          setCompletionData(completionResult);

          // Add to completed exercises
          setCompletedExercises(prev => {
            const updated = new Set(prev);
            updated.add(currentExercise.exerciseId);
            return updated;
          });

          // Update progress
          setProgress(() => {
            const newProgress = (completedExercises.size + 1) / allExercises.length;
            return Math.min(newProgress, 1);
          });

          setResult({
            correct: true,
            message: `Correct! ${completionResult.alreadyCompleted
              ? "You've already completed this exercise before."
              : `You earned ${completionResult.awardedXp} XP!`}`
          });
        } catch (err) {
          setResult({
            correct: true,
            message: "Correct! But there was an error recording your progress."
          });
          console.error("Error recording completion:", err);
        }
      } else {
        // Incorrect answer
        setResult({
          correct: false,
          message: "Incorrect answer. Let's try another exercise!"
        });
      }

      setShowResult(true);
    };

    // Execute immediately
    submitFn();

  }, [currentExercise, selectedOption, textAnswer, isTimerRunning, user, API_BASE_URL, allExercises.length, completedExercises]);

  // Auto-move to next exercise after showing result
  useEffect(() => {
    if (showResult) {
      const nextExerciseTimer = setTimeout(() => {
        selectNextExercise();
      }, 2000); // Go to next exercise after 2 seconds

      return () => clearTimeout(nextExerciseTimer);
    }
  }, [showResult, selectNextExercise]);

  // Return to course page
  const handleReturn = useCallback(() => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate("/home");
    }
  }, [courseId, navigate]);

  // Loading state
  if (loading) {
    return <LoadingPage message="Loading auto exercise mode..." fullScreen={false} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-3">
        <p className="text-sm md:text-base text-red-600 dark:text-red-400 mb-2 md:mb-3 text-center">
          Error: {error}
        </p>
        <button
          onClick={handleReturn}
          className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white rounded-lg text-xs md:text-sm transition-all animate-cyan-wave"
        >
          Return to Course
        </button>
      </div>
    );
  }

  // All exercises completed state
  if (allCompleted) {
    return (
      <div className="max-w-full md:max-w-3xl mx-auto px-2 sm:px-3 py-1 md:py-3">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-3 text-center gap-4">
          <div className="glass-card border-2 border-white/20 dark:border-white/10 shadow-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-3 sm:mb-4">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium mb-4 sm:mb-6">
              You've completed all exercises in this course!
            </p>
            <button
              onClick={handleReturn}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-cyan-wave shimmer"
            >
              Return to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No exercises available
  if (allExercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-3">
        <p className="text-sm md:text-base text-yellow-600 dark:text-yellow-400 mb-2 md:mb-3 text-center">
          No exercises available for this course
        </p>
        <button
          onClick={handleReturn}
          className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white rounded-lg text-xs md:text-sm transition-all animate-cyan-wave"
        >
          Return to Course
        </button>
      </div>
    );
  }

  // Current exercise not found (shouldn't happen, but as a safeguard)
  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-3">
        <p className="text-sm md:text-base text-yellow-600 dark:text-yellow-400 mb-2 md:mb-3 text-center">
          No exercise available to display
        </p>
        <button
          onClick={handleReturn}
          className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white rounded-lg text-xs md:text-sm transition-all animate-cyan-wave"
        >
          Return to Course
        </button>
      </div>
    );
  }

  return (
    // Main container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-full md:max-w-3xl mx-auto px-2 sm:px-3 py-1 md:py-2">
        {/* Reduced gap and min-height */}
        <div className="flex flex-col gap-1 sm:gap-1.5 min-h-[calc(100vh-80px)]">
          {/* Enhanced header with glassmorphism */}
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <button
              onClick={handleReturn}
              className="group glass-card flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-xl sm:rounded-2xl
              shadow-lg hover:shadow-xl
              transition-all duration-300
              font-semibold text-xs sm:text-sm md:text-base
              hover:scale-105 hover:-translate-x-1"
              aria-label="Return to course page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform duration-200 text-cyan-500 dark:text-cyan-400"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="gradient-text">Back to Course</span>
            </button>

            {/* Enhanced progress indicator */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {Math.round(progress * 100)}% Complete
                </span>
                <div className={`py-0.5 sm:py-1 px-2 sm:px-4 rounded-full font-medium sm:font-bold text-white text-xs sm:text-sm md:text-base
                ${timeLeft > 5 ? 'bg-green-500 dark:bg-green-600' :
                    timeLeft > 2 ? 'bg-yellow-500 dark:bg-yellow-600' :
                      'bg-red-500 dark:bg-red-600 animate-pulse'}`}>
                  {timeLeft}s
                </div>
              </div>
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-600 rounded-full transition-all duration-700 animate-cyan-wave"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Enhanced main content */}
          <div className="text-center mb-2">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold gradient-text mb-1">
              {currentExercise.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {currentExercise.type} • Difficulty: {currentExercise.difficultyLevel}
            </p>
          </div>

          <div className="glass-card border-2 border-white/20 dark:border-white/10 shadow-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm md:text-base text-gray-800 dark:text-white font-medium">
              {currentExercise.question}
            </p>
          </div>

          <div className="glass-card border-2 border-white/30 dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 md:p-3 min-h-[5rem] sm:min-h-[6rem] md:min-h-[8rem] flex flex-col items-center justify-center overflow-auto mb-2 sm:mb-3 shadow-lg">
            {currentExercise.animType ? (
              <ExerciseAnimation
                animType={currentExercise.animType}
                question={currentExercise.question}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No animation for this exercise</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-2 sm:mb-3">
            {currentExercise.type === 'multiple-choice' ? (
              currentExercise.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={!isTimerRunning || showResult}
                  className={`
                  glass-card p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 text-xs sm:text-sm md:text-base
                  flex items-center min-h-[2.5rem] sm:min-h-[3rem] font-medium
                  ${selectedOption === option
                      ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 border-cyan-400/50 shadow-xl scale-105 text-white glow animate-cyan-wave'
                      : 'border-white/40 dark:border-white/20 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:scale-105 hover:shadow-xl text-gray-800 dark:text-white'}
                  ${!isTimerRunning || showResult ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer shimmer'}
                `}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="col-span-2">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={handleTextChange}
                  disabled={!isTimerRunning || showResult}
                  placeholder="Type your answer here..."
                  className={`
                  glass-card w-full p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border-2 text-xs sm:text-sm md:text-base
                  min-h-[2.5rem] sm:min-h-[3rem] font-medium
                  border-white/40 dark:border-white/20
                  focus:border-cyan-400/50 dark:focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800
                  text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                  ${!isTimerRunning || showResult ? 'opacity-70 cursor-not-allowed' : 'shadow-lg'}
                `}
                />
              </div>
            )}
          </div>

          {/* Enhanced submit button */}
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={
                (currentExercise.type === 'multiple-choice' && !selectedOption) ||
                (currentExercise.type === 'fill-in' && !textAnswer.trim()) ||
                !isTimerRunning ||
                showResult
              }
              className={`
              w-full py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg font-bold rounded-xl sm:rounded-2xl transition-all duration-300
              ${((currentExercise.type === 'multiple-choice' && !selectedOption) ||
                  (currentExercise.type === 'fill-in' && !textAnswer.trim()) ||
                  !isTimerRunning ||
                  showResult)
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white dark:text-gray-300'
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 animate-cyan-wave shimmer'}
            `}
            >
              Submit Answer
            </button>
          ) : (
            <div className={`glass-card p-3 sm:p-4 md:p-5 text-center rounded-xl sm:rounded-2xl border-2 shadow-xl ${result?.correct
              ? 'border-green-400/50 dark:border-green-500/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300'
              : 'border-red-400/50 dark:border-red-500/50 bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-300'
              }`}>
              <p className="font-bold text-base sm:text-lg md:text-xl mb-1">
                {result?.correct ? '✓ Correct!' : '✗ Incorrect!'}
              </p>
              <p className="text-xs sm:text-sm md:text-base">{result?.message}</p>

              {/* Enhanced XP and rewards */}
              {completionData && !completionData.alreadyCompleted && (
                <div className="mt-2 sm:mt-3 font-bold text-xs sm:text-sm md:text-base flex flex-wrap justify-center gap-2 sm:gap-3">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full shadow-md">XP: +{completionData.awardedXp}</span>
                  {completionData.gems && <span className="px-2.5 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-full shadow-md">Gems: +{completionData.gems}</span>}
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-md">Total: {completionData.currentXp} XP</span>
                  <span className="px-2.5 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full shadow-md">Level: {completionData.level}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-600 dark:text-gray-400 font-medium">
                Loading next exercise...
              </p>
            </div>
          )}
          {/* Optional spacer div to push content up from bottom */}
          <div className="flex-grow"></div>
        </div>
      </div>
    </div>
  );
};

export default AutoExercise;