import React from "react";
import Logo from "../common/Logo";

interface CustomLoaderProps {
    loading: boolean;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ loading }) => {
    if (!loading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center custom-black-white-theme-switch-bg z-50 animate-pulse">
            <Logo size="xxlarge"/>
        </div>
    );
};

export default CustomLoader;