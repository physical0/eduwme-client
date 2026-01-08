import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Types for battle socket events
export interface Opponent {
    odId: string;
    odname: string;
    profilePicture?: string;
}

export interface MatchFoundData {
    battleId: string;
    opponent: Opponent;
    totalQuestions: number;
}

export interface QuestionData {
    questionNumber: number;
    totalQuestions: number;
    question: string;
    options: string[];
    timeLimit: number;
}

export interface QuestionResultData {
    questionNumber: number;
    correctAnswer: string;
    results: {
        odId: string;
        odname: string;
        answer: string | null;
        isCorrect: boolean;
        pointsEarned: number;
        newScore: number;
    }[];
    timeout: boolean;
}

export interface BattleEndData {
    battleId: string;
    winner: Opponent | null;
    isDraw: boolean;
    isForfeit: boolean;
    players: {
        odId: string;
        odname: string;
        profilePicture?: string;
        finalScore: number;
        xpEarned: number;
        gemsEarned: number;
        isWinner: boolean;
    }[];
}

// Socket context type
interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    isInQueue: boolean;
    battleState: BattleState | null;
    joinQueue: () => void;
    leaveQueue: () => void;
    submitAnswer: (battleId: string, answer: string, timeMs: number) => void;
    resetBattleState: () => void;
}

export interface BattleState {
    battleId: string;
    opponent: Opponent | null;
    status: 'searching' | 'countdown' | 'question' | 'result' | 'ended';
    countdown: number;
    currentQuestion: QuestionData | null;
    questionResult: QuestionResultData | null;
    finalResult: BattleEndData | null;
    myScore: number;
    opponentScore: number;
    opponentAnswered: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const { user, isAuthenticated, getAuthHeader } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);
    const [battleState, setBattleState] = useState<BattleState | null>(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Initialize socket connection
    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const initSocket = async () => {
            const authHeader = await getAuthHeader();
            const token = authHeader.Authorization?.replace('Bearer ', '') || sessionStorage.getItem('authToken');

            const newSocket = io(API_BASE_URL, {
                path: '/battle-socket',
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            newSocket.on('connect', () => {
                console.log('⚔️ Battle socket connected');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('⚔️ Battle socket disconnected');
                setIsConnected(false);
                setIsInQueue(false);
            });

            newSocket.on('error', (error: { message: string }) => {
                console.error('⚔️ Battle socket error:', error.message);
            });

            // Queue events
            newSocket.on('queueJoined', (data: { position: number }) => {
                console.log('📋 Joined queue, position:', data.position);
                setIsInQueue(true);
                setBattleState({
                    battleId: '',
                    opponent: null,
                    status: 'searching',
                    countdown: 0,
                    currentQuestion: null,
                    questionResult: null,
                    finalResult: null,
                    myScore: 0,
                    opponentScore: 0,
                    opponentAnswered: false
                });
            });

            newSocket.on('queueLeft', () => {
                console.log('📋 Left queue');
                setIsInQueue(false);
                setBattleState(null);
            });

            // Match found
            newSocket.on('matchFound', (data: MatchFoundData) => {
                console.log('⚔️ Match found!', data);
                setIsInQueue(false);
                setBattleState(prev => ({
                    ...prev!,
                    battleId: data.battleId,
                    opponent: data.opponent,
                    status: 'countdown'
                }));
            });

            // Countdown
            newSocket.on('countdown', (data: { seconds: number }) => {
                setBattleState(prev => prev ? {
                    ...prev,
                    status: 'countdown',
                    countdown: data.seconds
                } : null);
            });

            // Question
            newSocket.on('question', (data: QuestionData) => {
                console.log('❓ New question:', data.questionNumber);
                setBattleState(prev => prev ? {
                    ...prev,
                    status: 'question',
                    currentQuestion: data,
                    questionResult: null,
                    opponentAnswered: false
                } : null);
            });

            // Opponent answered
            newSocket.on('opponentAnswered', () => {
                setBattleState(prev => prev ? {
                    ...prev,
                    opponentAnswered: true
                } : null);
            });

            // Question result
            newSocket.on('questionResult', (data: QuestionResultData) => {
                console.log('📊 Question result:', data);
                const myResult = data.results.find(r => r.odId === user?._id);
                const opponentResult = data.results.find(r => r.odId !== user?._id);

                setBattleState(prev => prev ? {
                    ...prev,
                    status: 'result',
                    questionResult: data,
                    myScore: myResult?.newScore || prev.myScore,
                    opponentScore: opponentResult?.newScore || prev.opponentScore
                } : null);
            });

            // Battle ended
            newSocket.on('battleEnd', (data: BattleEndData) => {
                console.log('🏆 Battle ended:', data);
                setBattleState(prev => prev ? {
                    ...prev,
                    status: 'ended',
                    finalResult: data
                } : null);
            });

            // Opponent disconnected
            newSocket.on('opponentDisconnected', (data: { battleId: string; message: string }) => {
                console.log('💔 Opponent disconnected:', data.message);
                setBattleState(prev => prev ? {
                    ...prev,
                    status: 'ended'
                } : null);
            });

            setSocket(newSocket);
        };

        initSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isAuthenticated, user?._id]);

    const joinQueue = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('joinQueue');
        }
    }, [socket, isConnected]);

    const leaveQueue = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('leaveQueue');
            setIsInQueue(false);
            setBattleState(null);
        }
    }, [socket, isConnected]);

    const submitAnswer = useCallback((battleId: string, answer: string, timeMs: number) => {
        if (socket && isConnected) {
            socket.emit('submitAnswer', { battleId, answer, timeMs });
        }
    }, [socket, isConnected]);

    const resetBattleState = useCallback(() => {
        setBattleState(null);
        setIsInQueue(false);
    }, []);

    const value: SocketContextType = {
        socket,
        isConnected,
        isInQueue,
        battleState,
        joinQueue,
        leaveQueue,
        submitAnswer,
        resetBattleState
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
