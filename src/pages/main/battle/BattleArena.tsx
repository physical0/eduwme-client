import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@src/contexts/AuthContext';
import { useSocket } from '@src/contexts/SocketContext';

const BattleArena = () => {
    const navigate = useNavigate();
    const { user, fetchUser } = useAuth();
    const { battleState, submitAnswer, resetBattleState } = useSocket();

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [hasAnswered, setHasAnswered] = useState(false);
    const questionStartTime = useRef<number>(Date.now());

    // If no battle state, redirect to lobby
    useEffect(() => {
        if (!battleState || !battleState.battleId) {
            navigate('/battle');
        }
    }, [battleState, navigate]);

    // Timer for questions
    useEffect(() => {
        if (battleState?.status === 'question' && battleState.currentQuestion) {
            questionStartTime.current = Date.now();
            setTimeLeft(Math.ceil(battleState.currentQuestion.timeLimit / 1000));
            setSelectedAnswer(null);
            setHasAnswered(false);

            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [battleState?.status, battleState?.currentQuestion?.questionNumber]);

    // Handle answer selection
    const handleSelectAnswer = useCallback((answer: string) => {
        if (hasAnswered || !battleState?.battleId) return;

        setSelectedAnswer(answer);
        setHasAnswered(true);

        const timeMs = Date.now() - questionStartTime.current;
        submitAnswer(battleState.battleId, answer, timeMs);
    }, [hasAnswered, battleState?.battleId, submitAnswer]);

    // Handle battle end
    const handleReturnToLobby = useCallback(() => {
        resetBattleState();
        fetchUser(); // Refresh user data for updated XP/gems
        navigate('/battle');
    }, [resetBattleState, fetchUser, navigate]);

    const handleGoHome = useCallback(() => {
        resetBattleState();
        fetchUser();
        navigate('/');
    }, [resetBattleState, fetchUser, navigate]);

    if (!battleState || !user) return null;

    const { status, opponent, currentQuestion, questionResult, finalResult, myScore, opponentScore, countdown, opponentAnswered } = battleState;

    // Countdown Screen
    if (status === 'countdown') {
        return (
            <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Battle Starting!</h2>
                    <div className="flex items-center justify-center gap-8 mb-8">
                        {/* You */}
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-2 bg-gradient-to-br from-cyan-400 to-blue-500">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold">{user.username}</p>
                        </div>

                        <div className="text-4xl font-bold">VS</div>

                        {/* Opponent */}
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-2 bg-gradient-to-br from-red-400 to-pink-500">
                                {opponent?.profilePicture ? (
                                    <img src={opponent.profilePicture} alt={opponent.odname} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                                        {opponent?.odname?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold">{opponent?.odname}</p>
                        </div>
                    </div>

                    {/* Countdown number */}
                    <div className="text-9xl font-black animate-pulse">
                        {countdown}
                    </div>
                </div>
            </div>
        );
    }

    // Question Screen
    if (status === 'question' && currentQuestion) {
        const timerColor = timeLeft > 10 ? 'text-green-500' : timeLeft > 5 ? 'text-yellow-500' : 'text-red-500';
        const timerBgColor = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Score Header */}
                    <div className="glass-card rounded-2xl p-4 mb-4 border border-white/20 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            {/* You */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{user.username}</p>
                                    <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{myScore}</p>
                                </div>
                            </div>

                            {/* VS */}
                            <div className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Question</div>
                                <div className="text-xl font-bold gradient-text">
                                    {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
                                </div>
                            </div>

                            {/* Opponent */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{opponent?.odname}</p>
                                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{opponentScore}</p>
                                </div>
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-400 shadow-lg bg-gradient-to-br from-red-400 to-pink-500">
                                    {opponent?.profilePicture ? (
                                        <img src={opponent.profilePicture} alt={opponent.odname} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                            {opponent?.odname?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {opponentAnswered && (
                                        <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                                            <span className="text-white text-xl">✓</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Left</span>
                            <span className={`text-2xl font-bold ${timerColor}`}>{timeLeft}s</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${timerBgColor} transition-all duration-1000 ease-linear`}
                                style={{ width: `${(timeLeft / 15) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="glass-card rounded-2xl p-6 mb-4 border-2 border-purple-300/50 dark:border-purple-700/50">
                        <p className="text-xl font-medium text-gray-800 dark:text-white text-center">
                            {currentQuestion.question}
                        </p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(option)}
                                disabled={hasAnswered}
                                className={`p-4 rounded-xl border-2 text-left font-medium transition-all duration-300 ${selectedAnswer === option
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 text-white shadow-lg scale-105'
                                        : hasAnswered
                                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                                            : 'glass-card border-white/30 dark:border-white/10 text-gray-800 dark:text-white hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg hover:scale-102'
                                    }`}
                            >
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold mr-3">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Answered indicator */}
                    {hasAnswered && (
                        <div className="mt-4 text-center text-gray-600 dark:text-gray-400 animate-pulse">
                            Waiting for opponent...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Result Screen (between questions)
    if (status === 'result' && questionResult) {
        const myResult = questionResult.results.find(r => r.odId === user._id);
        const opponentResult = questionResult.results.find(r => r.odId !== user._id);

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="glass-card rounded-2xl p-8 text-center border-2 border-white/20 dark:border-white/10">
                        <h2 className="text-2xl font-bold mb-6 gradient-text">Question {questionResult.questionNumber} Results</h2>

                        {/* Correct Answer */}
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-300 dark:border-green-700">
                            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Correct Answer</p>
                            <p className="text-lg font-bold text-green-700 dark:text-green-300">{questionResult.correctAnswer}</p>
                        </div>

                        {/* Results comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Your result */}
                            <div className={`p-4 rounded-xl border-2 ${myResult?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">You</p>
                                <p className="text-3xl mb-1">{myResult?.isCorrect ? '✓' : '✗'}</p>
                                <p className={`font-bold ${myResult?.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    +{myResult?.pointsEarned || 0} pts
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {myResult?.newScore}
                                </p>
                            </div>

                            {/* Opponent result */}
                            <div className={`p-4 rounded-xl border-2 ${opponentResult?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{opponent?.odname}</p>
                                <p className="text-3xl mb-1">{opponentResult?.isCorrect ? '✓' : '✗'}</p>
                                <p className={`font-bold ${opponentResult?.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    +{opponentResult?.pointsEarned || 0} pts
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {opponentResult?.newScore}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
                            Next question coming up...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Final Results Screen
    if (status === 'ended' && finalResult) {
        const myFinalResult = finalResult.players.find(p => p.odId === user._id);
        const opponentFinalResult = finalResult.players.find(p => p.odId !== user._id);
        const isWinner = myFinalResult?.isWinner;
        const isDraw = finalResult.isDraw;

        return (
            <div className={`min-h-screen py-8 px-4 ${isWinner ? 'bg-gradient-to-br from-yellow-100 via-green-100 to-cyan-100 dark:from-yellow-900/20 dark:via-green-900/20 dark:to-cyan-900/20' : isDraw ? 'bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20' : 'bg-gradient-to-br from-gray-100 via-red-100 to-pink-100 dark:from-gray-900 dark:via-red-900/20 dark:to-pink-900/20'}`}>
                <div className="max-w-lg mx-auto">
                    <div className="glass-card rounded-2xl p-8 text-center border-2 border-white/20 dark:border-white/10">
                        {/* Result Banner */}
                        <div className="mb-6">
                            <div className={`text-6xl mb-2 ${isWinner ? 'animate-bounce' : ''}`}>
                                {isWinner ? '🏆' : isDraw ? '🤝' : '😔'}
                            </div>
                            <h2 className={`text-3xl font-black ${isWinner ? 'text-yellow-600 dark:text-yellow-400' : isDraw ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {isWinner ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEAT'}
                            </h2>
                        </div>

                        {/* Score comparison */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You</p>
                                <p className="text-4xl font-black text-cyan-600 dark:text-cyan-400">{myFinalResult?.finalScore}</p>
                            </div>
                            <div className="text-2xl text-gray-400">-</div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{opponentFinalResult?.odname}</p>
                                <p className="text-4xl font-black text-red-600 dark:text-red-400">{opponentFinalResult?.finalScore}</p>
                            </div>
                        </div>

                        {/* Rewards */}
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Rewards Earned</p>
                            <div className="flex justify-center gap-4">
                                <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow-lg">
                                    +{myFinalResult?.xpEarned} XP
                                </div>
                                <div className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full font-bold shadow-lg">
                                    +{myFinalResult?.gemsEarned} 💎
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleReturnToLobby}
                                className="py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="py-3 px-4 glass-card text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default BattleArena;
