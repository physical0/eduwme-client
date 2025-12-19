import LoadingPage from "@src/components/loading";
import { useState, useEffect } from "react";
import { useAuth } from "@src/contexts/AuthContext";

// Interface based on your User model schema
interface LeaderboardUser {
  dateLastLogin: unknown;
  username: string;
  nickname?: string;
  xp: number;
  level?: number;
  profilePicture?: string;
  gems?: number;
}

interface currentUser {
  _id: string;
  username: string;
  nickname?: string;
  profilePicture?: string;
  xp: number;
  level: number;
  gems?: number;
  dateLastLogin?: string;
  streak?: number;
}

const LeaderboardPage = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<currentUser | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const authHeader = useAuth().getAuthHeader;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/leaderboard`, {
          method: "GET",
          headers: await authHeader(),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Sort users by XP and add rank property
        const rankedUsers = data.leaderboard
          .sort((a: LeaderboardUser, b: LeaderboardUser) => b.xp - a.xp)
          .map((user: LeaderboardUser, index: number) => ({
            ...user,
            rank: index + 1
          }));

        setUsers(rankedUsers);

        // Get current user
        try {
          const meResponse = await fetch(`${API_BASE_URL}/users/getMe`, {
            credentials: "include",
            headers: await authHeader(),
          });

          if (meResponse.ok) {
            const meData = await meResponse.json();
            setCurrentUser(meData);
          }
        } catch (err) {
          console.log("Could not fetch current user:", err);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(error instanceof Error ? error.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Generate colors based on rank
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"; // Gold
    if (rank === 2) return "text-gray-400";   // Silver
    if (rank === 3) return "text-amber-600";  // Bronze
    return "text-cyan-600 dark:text-cyan-400";                  // Match your app's Cyan theme
  };

  // Generate background colors based on rank
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100";
    if (rank === 2) return "bg-gray-100";
    if (rank === 3) return "bg-amber-50";
    return rank % 2 === 0 ? "bg-white/60" : "bg-white/40";
  };

  // Generate avatar placeholder if no profile picture
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Calculate streak from last login (for demo purposes)
  const getStreakDays = (user: LeaderboardUser) => {
    if (!user.dateLastLogin) return null;
    return Math.floor(Math.random() * 30) + 1;
  };

  if (loading) {
    return <LoadingPage message="Loading leaderboard..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="gap-4 md:gap-5 flex flex-col mt-12 md:mt-20 items-center justify-center">
        {/* Added dark mode support */}
        <p className="text-base md:text-lg text-red-600 dark:text-red-400">Error: {error}</p>
        {/* Enhanced button with better responsive padding and dark mode */}
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white rounded-lg hover:from-cyan-500 hover:to-cyan-700 transition-colors animate-cyan-wave"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 pt-2 sm:pt-4">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 pb-20">
        {/* Heading with dark mode outline */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2 md:mb-3 text-gray-800 dark:text-gray-100 dark:text-outline">Leaderboard</h1>
        {/* Subheading with dark mode outline */}
        <p className="text-gray-600 dark:text-gray-300 dark:text-outline text-xs sm:text-sm text-center mb-3 md:mb-4">See how you stack up against other learners!</p>

        {/* Top 3 users podium */}
        {users.length > 0 && (
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 md:mb-5 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
            {/* Silver - 2nd place (left) */}
            <div className="col-span-1 flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl p-1 sm:p-2 border border-gray-300 dark:border-gray-700 shadow-md">
              <div className="relative mb-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs sm:text-sm md:text-base font-bold overflow-hidden">
                  {users[1] && users[1].profilePicture ? (
                    <img src={users[1].profilePicture} alt={users[1].username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(users[1]?.username || "")}</span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-gray-400 text-white font-bold text-[8px] sm:text-[10px] flex items-center justify-center border border-white dark:border-gray-800">
                  2
                </div>
              </div>
              <p className="font-bold text-[8px] sm:text-[10px] md:text-xs text-center truncate w-full text-gray-800 dark:text-gray-100 dark:text-outline">
                {users[1]?.nickname || users[1]?.username || ""}
              </p>
              <p className="text-[8px] sm:text-[10px] text-gray-600 dark:text-gray-200 dark:text-outline">
                {users[1]?.xp || 0} XP
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-[8px] sm:text-[10px] text-cyan-600 dark:text-cyan-400 dark:text-outline">
                  Lvl {users[1]?.level || 1}
                </span>
              </div>
            </div>

            {/* Gold - 1st place (center) */}
            <div className="col-span-1 flex flex-col items-center bg-yellow-100 dark:bg-yellow-900/40 rounded-lg sm:rounded-xl p-1 sm:p-2 border-2 border-yellow-300 dark:border-yellow-600 shadow-md transform scale-105 sm:scale-110 -mt-2 z-10">
              <div className="relative mb-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-yellow-300 dark:bg-yellow-600 flex items-center justify-center text-sm sm:text-base md:text-lg font-bold overflow-hidden">
                  {users[0] && users[0].profilePicture ? (
                    <img src={users[0].profilePicture} alt={users[0].username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(users[0]?.username || "")}</span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-yellow-500 text-white font-bold text-[9px] sm:text-[11px] flex items-center justify-center border border-white dark:border-yellow-900">
                  1
                </div>
              </div>
              <p className="font-bold text-[9px] sm:text-xs md:text-sm text-center truncate w-full text-gray-800 dark:text-gray-100 dark:text-outline">
                {users[0]?.nickname || users[0]?.username || ""}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-200 dark:text-outline">
                {users[0]?.xp || 0} XP
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-[8px] sm:text-[10px] text-cyan-600 dark:text-cyan-400 dark:text-outline">
                  Lvl {users[0]?.level || 1}
                </span>
              </div>
            </div>

            {/* Bronze - 3rd place (right) */}
            <div className="col-span-1 flex flex-col items-center bg-amber-50 dark:bg-amber-900/30 rounded-lg sm:rounded-xl p-1 sm:p-2 border border-amber-300 dark:border-amber-700 shadow-md">
              <div className="relative mb-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-amber-300 dark:bg-amber-600 flex items-center justify-center text-xs sm:text-sm md:text-base font-bold overflow-hidden">
                  {users[2] && users[2].profilePicture ? (
                    <img src={users[2].profilePicture} alt={users[2].username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(users[2]?.username || "")}</span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-amber-600 text-white font-bold text-[8px] sm:text-[10px] flex items-center justify-center border border-white dark:border-amber-900">
                  3
                </div>
              </div>
              <p className="font-bold text-[8px] sm:text-[10px] md:text-xs text-center truncate w-full text-gray-800 dark:text-gray-100 dark:text-outline">
                {users[2]?.nickname || users[2]?.username || ""}
              </p>
              <p className="text-[8px] sm:text-[10px] text-gray-600 dark:text-gray-200 dark:text-outline">
                {users[2]?.xp || 0} XP
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-[8px] sm:text-[10px] text-cyan-600 dark:text-cyan-400 dark:text-outline">
                  Lvl {users[2]?.level || 1}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Full leaderboard table */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg sm:rounded-xl shadow-md overflow-hidden border border-cyan-200 dark:border-cyan-800/40">
          {/* Table header - Changed to cyan animated wave in dark mode */}
          <div className="bg-gradient-to-r from-cyan-400 to-cyan-600 animate-cyan-wave px-2 sm:px-3 py-1.5 sm:py-2 text-white grid grid-cols-12 gap-1">
            <div className="col-span-2 sm:col-span-1 text-[9px] sm:text-[10px] font-medium uppercase dark:text-purple-600">Rank</div>
            <div className="col-span-6 sm:col-span-7 md:col-span-8 text-[9px] sm:text-[10px] font-medium uppercase dark:text-purple-600">User</div>
            <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right text-[9px] sm:text-[10px] font-medium uppercase dark:text-purple-600">XP</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user, index) => (
              <div
                key={user.username}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 grid grid-cols-12 gap-1 items-center ${getRankBgColor(index + 1)} ${currentUser?.username === user.username ? 'border-l-4 border-cyan-500 dark:border-cyan-400' : ''} transition-colors hover:bg-cyan-50 dark:hover:bg-cyan-900/10`}
              >
                {/* Rank column - Purple text in dark mode */}
                <div className="col-span-2 sm:col-span-1">
                  <div className={`text-[9px] sm:text-[10px] md:text-xs font-bold ${getRankColor(index + 1)} dark:text-purple-600`}>
                    #{index + 1}
                  </div>
                </div>

                {/* User column */}
                <div className="col-span-6 sm:col-span-7 md:col-span-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 font-bold">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full" />
                      ) : (
                        getInitials(user.username)
                      )}
                    </div>
                    <div className="ml-1 sm:ml-2">
                      {/* Username - Purple text in dark mode */}
                      <div className="text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-900 dark:text-purple-200 truncate max-w-[70px] sm:max-w-[100px] md:max-w-full">
                        {user.nickname || user.username}
                      </div>
                      <div className="hidden sm:flex items-center">
                        {getStreakDays(user) && (
                          <div className="text-[7px] sm:text-[9px] text-yellow-600 dark:text-yellow-300 mr-1.5">🔥 {getStreakDays(user)}</div>
                        )}
                        {/* Level badge - Purple in dark mode */}
                        <span className="px-1 py-0.5 text-[7px] sm:text-[9px] rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                          Lvl {user.level || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* XP column - Purple text in dark mode */}
                <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right">
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-900 dark:text-purple-200 font-medium">{user.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 sm:py-10 bg-white/60 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl shadow-md border border-cyan-200/20 dark:border-cyan-800/40">
            <p className="text-gray-500 dark:text-purple-200">No users on the leaderboard yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};



export default LeaderboardPage;