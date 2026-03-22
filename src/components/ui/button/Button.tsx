"use client";

import React, { useMemo } from "react";

type ButtonVariant = "filled" | "outline" | "subtle" | "light";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    color?: string; // hex or css var
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    fullWidth?: boolean;
    size?: ButtonSize;
    loading?: boolean;
    children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
    xs: "h-9 px-3 text-xs",
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
};

function hexToRgba(hex: string, alpha: number) {
    const clean = hex.replace("#", "").trim();
    if (!(clean.length === 3 || clean.length === 6)) return null;

    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;

    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "filled",
    color,
    leftSection,
    rightSection,
    fullWidth = false,
    size = "md",
    loading = false,
    children,
    className = "",
    disabled,
    type = "button",
    ...props
}) => {
    const baseColor = color || "var(--brand-primary)";

    const styles = useMemo<React.CSSProperties>(() => {
        // allow both #hex and css variables
        const isHex = typeof baseColor === "string" && baseColor.startsWith("#");
        const lightBg = isHex ? hexToRgba(baseColor, 0.14) : "var(--brand-primary-lighter)";
        const subtleBg = isHex ? hexToRgba(baseColor, 0.10) : "var(--brand-primary-lighter)";
        const ring = isHex ? hexToRgba(baseColor, 0.25) : "var(--brand-primary-light)";

        if (variant === "filled") return { backgroundColor: baseColor };
        if (variant === "outline") return { borderColor: baseColor, color: baseColor };
        if (variant === "light") return { backgroundColor: lightBg || "var(--brand-primary-lighter)", color: baseColor };
        if (variant === "subtle") return { color: baseColor, backgroundColor: subtleBg || "transparent" };
        return { boxShadow: `0 0 0 2px ${ring}` };
    }, [baseColor, variant]);

    const disabledOrLoading = disabled || loading;

    const variantClasses = {
        filled:
            "text-white hover:opacity-95 active:opacity-90",
        outline:
            "border bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
        light:
            "hover:opacity-95 active:opacity-90",
        subtle:
            "hover:bg-black/5 dark:hover:bg-white/5",
    }[variant];

    return (
        <button
            {...props}
            type={type}
            disabled={disabledOrLoading}
            aria-busy={loading ? "true" : "false"}
            className={[
                "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/35 dark:focus-visible:ring-[var(--accent-primary-on-dark)]/70 focus-visible:ring-offset-0",
                "shadow-sm",
                sizeClasses[size],
                variant === "outline" ? "border" : "",
                fullWidth ? "w-full" : "",
                disabledOrLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]",
                variantClasses,
                className,
            ].join(" ")}
            style={styles}
        >
            {loading ? (
                <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span>Sending…</span>
                </>
            ) : (
                <>
                    {leftSection ? <span className="inline-flex">{leftSection}</span> : null}
                    <span>{children}</span>
                    {rightSection ? <span className="inline-flex">{rightSection}</span> : null}
                </>
            )}
        </button>
    );
};
