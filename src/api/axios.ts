import { logout } from "@/contexts/UserContext";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from 'js-cookie';

export const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const accessToken = Cookies.get('accessTokenCargoPulse');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Check for 401 Unauthorized status, indicating expired access token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get the access token from cookies
                const accessToken = Cookies.get('accessTokenCargoPulse');

                if (!accessToken) {
                    logout();
                    window.location.href = '/';
                    // If there is no access token, log the user out
                    return Promise.reject(error);
                }

                return api(originalRequest);  // Retry the original request
            } catch (refreshError) {
                logout();
                window.location.href = '/';
                console.error("Token refresh failed:", refreshError);
                // If token refresh fails, log out the user or handle it appropriately
                return Promise.reject(refreshError);
            }
        }

        // If the error is not related to token expiration, reject the promise
        return Promise.reject(error);
    }
);