import React, { useState, useEffect, useRef } from 'react';
import type { Game } from '../../entities/game/game';

export const RandomGame: React.FC = () => {
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(false);
    const mountedRef = useRef(true);

    const fetchGame = async () => {
        if (!mountedRef.current) return;
        
        setLoading(true);
        
        try {
            console.log('🔍 Запрос игры...');
            const response = await fetch('http://localhost:3000/api/games/random');
            
            if (!response.ok) {
                console.warn('Сервер ответил с ошибкой:', response.status);
                return;
            }
            
            const data = await response.json();
            console.log('📨 Получен ответ:', data);
            
            if (data.success && data.data && mountedRef.current) {
                console.log('🎮 Игра найдена:', data.data.Name);
                setGame(data.data);
            }
        } catch (err) {
            console.log('⚠️ Не удалось получить игру:', err);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchGame();
        
        return () => {
            mountedRef.current = false;
        };
    }, []);

    if (loading && !game) {
        return (
            <div className='randomGame'>
                <span className='randomGameText'>Поиграй в</span>
                <span className='randomGameLoading'>...</span>
            </div>
        );
    }

    if (game) {
        return (
            <div className='randomGame'>
                <span className='randomGameText'>Поиграй в</span>
                <a 
                    href={game.Address} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='randomGameLink'
                >
                    {game.Name}
                </a>
            </div>
        );
    }

    return null;
};