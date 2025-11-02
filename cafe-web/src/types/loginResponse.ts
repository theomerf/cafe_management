export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userName?: string;
    avatarUrl?: string;
}