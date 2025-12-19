export interface Game {
    id: number;
    Name: string;
    Address: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    count?: number;
    error?: string;
}