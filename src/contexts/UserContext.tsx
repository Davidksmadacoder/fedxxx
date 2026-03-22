"use client";

import { IAdmin } from "@/lib/models/admin.model";
import React, { useState, createContext, useEffect, ReactNode } from "react";

interface LoginData {
    token: string;
    user: IAdmin;
}

interface UserContextType {
    accessToken: string | null;
    user: IAdmin | null;
    login: (data: LoginData) => void;
    logout: () => void;
    loading: boolean;
}

interface UserProviderProps {
    children: ReactNode;
}

export const logout = () => {
    document.cookie = "accessTokenCargoPulse=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userDataCargoPulse=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const UserContext = createContext<UserContextType>({
    accessToken: null,
    user: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days: number) => {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + days * 24 * 60 * 60 * 1000);
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiration.toUTCString()}; path=/; SameSite=Strict${secureFlag}`;
};

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<IAdmin | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const accessTokenFromCookie = getCookie("accessTokenCargoPulse");
        const userDataFromCookie = getCookie("userDataCargoPulse");
        if (accessTokenFromCookie && userDataFromCookie) {
            setAccessToken(accessTokenFromCookie);
            try {
                setUser(JSON.parse(userDataFromCookie) as IAdmin);
            } catch {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (data: LoginData) => {
        const { token, user } = data;
        setAccessToken(token);
        setUser(user);

        setCookie("accessTokenCargoPulse", token, 3);
        setCookie("userDataCargoPulse", JSON.stringify(user), 3);
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        document.cookie = "accessTokenCargoPulse=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userDataCargoPulse=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };

    return (
        <UserContext.Provider value={{ accessToken, user, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
