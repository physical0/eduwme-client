import LoadingPage from "@src/components/loading";
import { useState, useEffect } from "react";
import { useAuth } from "@src/contexts/AuthContext";
import { NavLink } from "react-router-dom";

// Interface based on your User model schema
interface LeaderboardUser {
  _id?: string;
  dateLastLogin: unknown;
  username: string;
  nickname?: string;
  xp: number;
  level?: number;
  profilePicture?: string;
  gems?: number;
  rank?: number;
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

  // Get medal emoji for top 3
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  // Generate background gradient based on rank
  const getRankGradient = (rank: number) => {
    if (rank === 1) return "from-yellow-400 via-yellow-500 to-amber-500";
    if (rank === 2) return "from-gray-300 via-gray-400 to-gray-500";
    if (rank === 3) return "from-amber-500 via-orange-500 to-amber-600";
    return "from-cyan-500 to-blue-500";
  };

  // Generate avatar placeholder if no profile picture
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Get current user's rank
  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  if (loading) {
    return <LoadingPage message="Loading leaderboard..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex flex-col items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md fade-in-stagger">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Failed to load leaderboard
          </h2>
          <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-6 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-xl">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 pt-2 sm:pt-4">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 pb-24 sm:pb-20">

        {/* Header Section */}
        <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-5 mb-3 sm:mb-6 fade-in-stagger border border-white/20 dark:border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <span className="text-2xl sm:text-4xl">🏆</span>
            <h1 className="text-lg sm:text-3xl md:text-4xl font-bold gradient-text">
              Leaderboard
            </h1>
          </div>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            See how you stack up against other learners!
          </p>

          {/* Current User's Rank Badge */}
          {currentUser && getCurrentUserRank() && (
            <div className="mt-2 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-2 glass-card rounded-full border border-cyan-200/50 dark:border-cyan-800/50">
              <span className="text-xs sm:text-base">📍</span>
              <span className="text-xs sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                Your Rank:
              </span>
              <span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                #{getCurrentUserRank()}
              </span>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="mb-4 sm:mb-8 fade-in-stagger" style={{ animationDelay: '100ms' }}>
            <div className="flex items-end justify-center gap-1.5 sm:gap-3 md:gap-4 max-w-md mx-auto px-1">

              {/* 2nd Place - Silver */}
              <div className="flex-1 max-w-[90px] sm:max-w-[140px]">
                <div className="glass-card rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center border border-gray-300/50 dark:border-gray-600/50 hover:shadow-xl transition-all duration-300 group">
                  {/* Avatar */}
                  <div className="relative mx-auto mb-1.5 sm:mb-3">
                    <div className="w-10 h-10 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-full overflow-hidden border-2 sm:border-3 border-gray-400 shadow-lg mx-auto bg-gradient-to-br from-gray-200 to-gray-400 group-hover:scale-105 transition-transform duration-300">
                      {users[1]?.profilePicture ? (
                        <img src={users[1].profilePicture} alt={users[1].username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm sm:text-xl font-bold text-gray-600">
                          {getInitials(users[1]?.username || "")}
                        </div>
                      )}
                    </div>
                    {/* Rank Badge */}
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold text-[10px] sm:text-base flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                      2
                    </div>
                  </div>

                  {/* Medal */}
                  <div className="text-lg sm:text-3xl mb-0.5 sm:mb-1">🥈</div>

                  {/* Name */}
                  <NavLink
                    to={`/profile/${users[1]?._id}`}
                    className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-white truncate block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {users[1]?.nickname || users[1]?.username || ""}
                  </NavLink>

                  {/* XP */}
                  <p className="text-[10px] sm:text-sm font-semibold bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-transparent">
                    {users[1]?.xp?.toLocaleString() || 0} XP
                  </p>

                  {/* Level */}
                  <span className="hidden sm:inline-block mt-1 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    Level {users[1]?.level || 1}
                  </span>
                </div>
                {/* Podium Bar */}
                <div className="h-8 sm:h-16 bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-lg mt-[-6px] sm:mt-[-8px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 shimmer"></div>
                </div>
              </div>

              {/* 1st Place - Gold (Center, Tallest) */}
              <div className="flex-1 max-w-[100px] sm:max-w-[160px] -mt-2 sm:-mt-6">
                <div className="glass-card rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center border border-yellow-400/50 dark:border-yellow-600/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                  {/* Crown */}
                  <div className="absolute -top-0.5 sm:-top-1 left-1/2 transform -translate-x-1/2 text-lg sm:text-3xl animate-bounce">
                    👑
                  </div>

                  {/* Avatar */}
                  <div className="relative mx-auto mb-1.5 sm:mb-3 mt-4 sm:mt-6">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 sm:border-4 border-yellow-500 shadow-xl mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 group-hover:scale-105 transition-transform duration-300">
                      {users[0]?.profilePicture ? (
                        <img src={users[0].profilePicture} alt={users[0].username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base sm:text-2xl font-bold text-yellow-700">
                          {getInitials(users[0]?.username || "")}
                        </div>
                      )}
                    </div>
                    {/* Rank Badge */}
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white font-bold text-xs sm:text-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-yellow-900">
                      1
                    </div>
                  </div>

                  {/* Medal */}
                  <div className="text-xl sm:text-4xl mb-0.5 sm:mb-1">🥇</div>

                  {/* Name */}
                  <NavLink
                    to={`/profile/${users[0]?._id}`}
                    className="font-bold text-xs sm:text-base text-gray-800 dark:text-white truncate block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {users[0]?.nickname || users[0]?.username || ""}
                  </NavLink>

                  {/* XP */}
                  <p className="text-xs sm:text-base font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                    {users[0]?.xp?.toLocaleString() || 0} XP
                  </p>

                  {/* Level */}
                  <span className="hidden sm:inline-block mt-1 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">
                    Level {users[0]?.level || 1}
                  </span>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none"></div>
                </div>
                {/* Podium Bar */}
                <div className="h-12 sm:h-24 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-b-lg mt-[-6px] sm:mt-[-8px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 shimmer"></div>
                </div>
              </div>

              {/* 3rd Place - Bronze */}
              <div className="flex-1 max-w-[90px] sm:max-w-[140px]">
                <div className="glass-card rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center border border-amber-400/50 dark:border-amber-700/50 hover:shadow-xl transition-all duration-300 group">
                  {/* Avatar */}
                  <div className="relative mx-auto mb-1.5 sm:mb-3">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 sm:border-3 border-amber-500 shadow-lg mx-auto bg-gradient-to-br from-amber-300 to-orange-500 group-hover:scale-105 transition-transform duration-300">
                      {users[2]?.profilePicture ? (
                        <img src={users[2].profilePicture} alt={users[2].username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm sm:text-xl font-bold text-amber-700">
                          {getInitials(users[2]?.username || "")}
                        </div>
                      )}
                    </div>
                    {/* Rank Badge */}
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-[10px] sm:text-base flex items-center justify-center shadow-lg border-2 border-white dark:border-amber-900">
                      3
                    </div>
                  </div>

                  {/* Medal */}
                  <div className="text-lg sm:text-3xl mb-0.5 sm:mb-1">🥉</div>

                  {/* Name */}
                  <NavLink
                    to={`/profile/${users[2]?._id}`}
                    className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-white truncate block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {users[2]?.nickname || users[2]?.username || ""}
                  </NavLink>

                  {/* XP */}
                  <p className="text-[10px] sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    {users[2]?.xp?.toLocaleString() || 0} XP
                  </p>

                  {/* Level */}
                  <span className="hidden sm:inline-block mt-1 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    Level {users[2]?.level || 1}
                  </span>
                </div>
                {/* Podium Bar */}
                <div className="h-6 sm:h-12 bg-gradient-to-b from-amber-400 to-orange-600 rounded-b-lg mt-[-6px] sm:mt-[-8px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="glass-card rounded-lg sm:rounded-2xl overflow-hidden shadow-xl fade-in-stagger border border-white/20 dark:border-white/10" style={{ animationDelay: '200ms' }}>
          {/* Table Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 sm:px-5 py-2 sm:py-4">
            <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-sm font-bold text-white/90 uppercase tracking-wide">#</span>
              </div>
              <div className="col-span-6 sm:col-span-7 md:col-span-8">
                <span className="text-[10px] sm:text-sm font-bold text-white/90 uppercase tracking-wide">Player</span>
              </div>
              <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right">
                <span className="text-[10px] sm:text-sm font-bold text-white/90 uppercase tracking-wide">XP</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser?.username === user.username;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={user.username}
                  className={`px-2.5 sm:px-5 py-2 sm:py-4 grid grid-cols-12 gap-1 sm:gap-2 items-center transition-all duration-300 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 group ${isCurrentUser
                    ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-l-4 border-cyan-500'
                    : ''
                    }`}
                  style={{ animationDelay: `${(index + 3) * 50}ms` }}
                >
                  {/* Rank Column */}
                  <div className="col-span-2 sm:col-span-1">
                    {isTopThree ? (
                      <div className="flex items-center gap-1">
                        <span className="text-base sm:text-xl">{getMedalEmoji(rank)}</span>
                      </div>
                    ) : (
                      <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold ${isCurrentUser
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                        {rank}
                      </div>
                    )}
                  </div>

                  {/* User Column */}
                  <div className="col-span-6 sm:col-span-7 md:col-span-8">
                    <NavLink
                      to={`/profile/${user._id}`}
                      className="flex items-center gap-1.5 sm:gap-3 group-hover:translate-x-1 transition-transform duration-300"
                    >
                      {/* Avatar */}
                      <div className={`relative flex-shrink-0 w-7 h-7 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-md ${isTopThree
                        ? `bg-gradient-to-br ${getRankGradient(rank)}`
                        : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                        }`}>
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-[10px] sm:text-base">
                            {getInitials(user.username)}
                          </div>
                        )}

                        {/* Current User Indicator */}
                        {isCurrentUser && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>

                      {/* Name & Level */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold text-[11px] sm:text-base truncate ${isCurrentUser
                            ? 'text-cyan-700 dark:text-cyan-300'
                            : 'text-gray-800 dark:text-white'
                            }`}>
                            {user.nickname || user.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[8px] sm:text-xs px-1 py-0.5 sm:px-1.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <div className="hidden sm:flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                            Lvl {user.level || 1}
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  </div>

                  {/* XP Column */}
                  <div className="col-span-4 sm:col-span-4 md:col-span-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-bold text-sm sm:text-base ${isTopThree
                        ? `bg-gradient-to-r ${getRankGradient(rank)} bg-clip-text text-transparent`
                        : isCurrentUser
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-gray-800 dark:text-white'
                        }`}>
                        {user.xp?.toLocaleString() || 0}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                No players yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to join the leaderboard!
              </p>
            </div>
          )}
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 text-center fade-in-stagger" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm text-gray-600 dark:text-gray-400 border border-white/30 dark:border-white/10">
            <span>💡</span>
            <span>Complete exercises and earn XP to climb the ranks!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;