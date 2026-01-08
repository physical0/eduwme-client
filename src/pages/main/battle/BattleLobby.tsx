import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@src/contexts/AuthContext';
import { useSocket } from '@src/contexts/SocketContext';
import LoadingPage from '@src/components/loading';

const BattleLobby = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isConnected, isInQueue, battleState, joinQueue, leaveQueue } = useSocket();
    const [searchTime, setSearchTime] = useState(0);

    // Track search time
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isInQueue && battleState?.status === 'searching') {
            interval = setInterval(() => {
                setSearchTime(prev => prev + 1);
            }, 1000);
        } else {
            setSearchTime(0);
        }
        return () => clearInterval(interval);
    }, [isInQueue, battleState?.status]);

    // Navigate to battle arena when match found
    useEffect(() => {
        if (battleState?.status === 'countdown' || battleState?.status === 'question') {
            navigate('/battle/arena');
        }
    }, [battleState?.status, navigate]);

    const handleFindMatch = useCallback(() => {
        if (!isConnected) return;
        joinQueue();
    }, [isConnected, joinQueue]);

    const handleCancelSearch = useCallback(() => {
        leaveQueue();
        setSearchTime(0);
    }, [leaveQueue]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!user) {
        return <LoadingPage message="Loading..." fullScreen={false} />;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-6 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="glass-card rounded-2xl p-6 mb-6 text-center border-2 border-white/20 dark:border-white/10 fade-in-stagger">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-4xl">⚔️</span>
                        <h1 className="text-3xl font-bold gradient-text">Quiz Battle</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Challenge other players to a real-time quiz duel!
                    </p>
                </div>

                {/* Player Card */}
                <div className="glass-card rounded-2xl p-6 mb-6 border border-cyan-200/50 dark:border-cyan-800/50 fade-in-stagger" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-cyan-400 shadow-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {user.username}
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                                    ⭐ {user.xp || 0} XP
                                </span>
                                <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium">
                                    💎 {user.gems || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connection Status */}
                {!isConnected && (
                    <div className="glass-card rounded-xl p-4 mb-6 border border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/20 fade-in-stagger" style={{ animationDelay: '150ms' }}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-pulse">🔌</span>
                            <div>
                                <p className="font-medium text-yellow-700 dark:text-yellow-300">Connecting to battle server...</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">Please wait a moment</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Searching State */}
                {isInQueue && battleState?.status === 'searching' && (
                    <div className="glass-card rounded-2xl p-8 mb-6 text-center border-2 border-purple-300/50 dark:border-purple-700/50 fade-in-stagger" style={{ animationDelay: '200ms' }}>
                        {/* Animated searching indicator */}
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl">🔍</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            Searching for opponent...
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Finding a worthy challenger
                        </p>

                        {/* Search time */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                            <span className="font-mono font-bold text-lg gradient-text">{formatTime(searchTime)}</span>
                        </div>

                        <button
                            onClick={handleCancelSearch}
                            className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                        >
                            Cancel Search
                        </button>
                    </div>
                )}

                {/* Ready to Battle */}
                {!isInQueue && isConnected && (
                    <div className="glass-card rounded-2xl p-8 mb-6 text-center border-2 border-cyan-300/50 dark:border-cyan-700/50 fade-in-stagger" style={{ animationDelay: '200ms' }}>
                        {/* Battle icon */}
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl">
                            <span className="text-4xl">⚔️</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            Ready to Battle?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Answer questions faster than your opponent to win XP and gems!
                        </p>

                        <button
                            onClick={handleFindMatch}
                            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 animate-cyan-wave"
                        >
                            Find Match
                        </button>
                    </div>
                )}

                {/* How to Play */}
                <div className="glass-card rounded-2xl p-6 border border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span>📖</span> How to Play
                    </h3>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">1</span>
                            <span>Click "Find Match" to search for an opponent</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">2</span>
                            <span>Answer 5 questions as fast as you can</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">3</span>
                            <span>Faster correct answers earn bonus points!</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">4</span>
                            <span>Win to earn XP and gems!</span>
                        </li>
                    </ul>

                    {/* Rewards preview */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rewards:</h4>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <div className="font-bold text-green-700 dark:text-green-400">Win</div>
                                <div className="text-green-600 dark:text-green-500 text-xs">50+ XP, 10 💎</div>
                            </div>
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                <div className="font-bold text-yellow-700 dark:text-yellow-400">Draw</div>
                                <div className="text-yellow-600 dark:text-yellow-500 text-xs">30+ XP, 5 💎</div>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <div className="font-bold text-gray-700 dark:text-gray-400">Lose</div>
                                <div className="text-gray-600 dark:text-gray-500 text-xs">15+ XP, 2 💎</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/home')}
                    className="w-full mt-6 py-3 px-6 glass-card text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 fade-in-stagger"
                    style={{ animationDelay: '400ms' }}
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default BattleLobby;
