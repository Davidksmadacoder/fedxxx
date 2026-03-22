"use client";

import { useState, useEffect, createContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import CustomLoader from "@/components/features/CustomLoader";

interface LoaderContextType {
    loading: boolean;
}

interface LoaderProviderProps {
    children: ReactNode;
}

export const LoaderContext = createContext<LoaderContextType>({ loading: false });

const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <LoaderContext.Provider value={{ loading }}>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center custom-black-white-theme-switch-bg z-50">
                    <CustomLoader loading={loading} />
                </div>
            )}
            {children}
        </LoaderContext.Provider>
    );
};

export default LoaderProvider;