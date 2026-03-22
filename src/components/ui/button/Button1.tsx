import React, { ButtonHTMLAttributes } from "react";

interface Button1Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading: boolean;
    loadingText: string;
    text: string;
}

const Button1: React.FC<Button1Props> = ({
    isLoading,
    loadingText,
    text,
    type = "submit",
    onClick,
    ...props
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button
            type={type}
            disabled={isLoading}
            onClick={handleClick}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-[var(--bg-general)] text-white disabled:opacity-50 cursor-pointer"
            {...props}
        >
            {isLoading ? loadingText : text}
        </button>
    );
};

export default Button1;
