import axios from 'axios';
import type { Game, ApiResponse } from '../../entities/game/game';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

export const gameApi = {
    async getRandomGame(): Promise<Game> {
        const response = await api.get<ApiResponse<Game>>('/games/random');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch random game');
        }
        return response.data.data!;
    },

    async getAllGames(): Promise<Game[]> {
        const response = await api.get<ApiResponse<Game[]>>('/games');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch games');
        }
        return response.data.data!;
    },

    async getGamesCount(): Promise<number> {
        const response = await api.get<ApiResponse<null>>('/games/count');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch games count');
        }
        return response.data.count!;
    },

    async getGameById(id: number): Promise<Game> {
        const response = await api.get<ApiResponse<Game>>(`/games/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch game');
        }
        return response.data.data!;
    },

    async checkHealth(): Promise<boolean> {
        try {
            const response = await api.get('/health');
            return response.status === 200;
        } catch {
            return false;
        }
    }
};