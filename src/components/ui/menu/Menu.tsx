"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    color?: string;
    disabled?: boolean;
}

interface MenuProps {
    children: React.ReactNode;
    items: MenuItem[];
    position?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
    width?: number;
    className?: string;
    /** px gap between trigger and menu */
    offset?: number;
    /** viewport padding for clamping */
    viewportPadding?: number;
}

type Coords = { top: number; left: number };

export const Menu: React.FC<MenuProps> = ({
    children,
    items,
    position = "bottom-end",
    width = 200,
    className = "",
    offset = 6,
    viewportPadding = 8,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // SSR safety for portal
    useEffect(() => setMounted(true), []);

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    const computePlacement = () => {
        const trigger = triggerRef.current;
        const menuEl = menuRef.current;
        if (!trigger || !menuEl) return;

        const rect = trigger.getBoundingClientRect();

        // fixed positioning => use viewport coordinates (NO scrollX/scrollY)
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        const menuW = width; // we force width via style
        const menuH = menuEl.offsetHeight || 0;

        // Requested placement
        let vertical: "top" | "bottom" = position.startsWith("top") ? "top" : "bottom";
        let horizontal: "start" | "end" = position.endsWith("start") ? "start" : "end";

        const spaceBelow = viewportH - rect.bottom;
        const spaceAbove = rect.top;

        // Flip vertically if it doesn't fit in the requested direction
        if (vertical === "bottom" && spaceBelow < menuH + offset + viewportPadding && spaceAbove > spaceBelow) {
            vertical = "top";
        } else if (vertical === "top" && spaceAbove < menuH + offset + viewportPadding && spaceBelow > spaceAbove) {
            vertical = "bottom";
        }

        // Base top/left
        let top =
            vertical === "bottom"
                ? rect.bottom + offset
                : rect.top - offset - menuH;

        let left =
            horizontal === "start"
                ? rect.left
                : rect.right - menuW;

        // Clamp into viewport
        left = clamp(left, viewportPadding, viewportW - menuW - viewportPadding);
        top = clamp(top, viewportPadding, viewportH - menuH - viewportPadding);

        setCoords({ top, left });
    };

    // Recompute after opening and when items change (height changes)
    useLayoutEffect(() => {
        if (!isOpen) return;
        // wait a frame so menu has correct height
        const raf = requestAnimationFrame(() => computePlacement());
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, items.length, width, position, offset, viewportPadding]);

    // Keep aligned on scroll/resize
    useEffect(() => {
        if (!isOpen) return;

        const onScrollOrResize = () => computePlacement();
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);

        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, width, position, offset, viewportPadding]);

    // Close on outside click + Escape
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current?.contains(target)) return;
            if (triggerRef.current?.contains(target)) return;
            setIsOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown, true);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown, true);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const menuContent =
        isOpen && mounted ? (
            <div
                ref={menuRef}
                role="menu"
                aria-orientation="vertical"
                className="fixed z-[9999] custom-black-white-theme-switch-bg border border-[var(--bg-general-light)] rounded-md shadow-lg py-1"
                style={{
                    width: `${width}px`,
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                }}
            >
                {items.map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={() => {
                            if (item.disabled) return;
                            item.onClick();
                            setIsOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm custom-black-white-theme-switch-text hover:bg-[var(--bg-general-lighter)] transition-colors ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        style={item.color ? { color: item.color } : undefined}
                    >
                        {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        ) : null;

    return (
        <div className={`relative ${className}`}>
            <div
                ref={triggerRef}
                role="button"
                tabIndex={0}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((v) => !v)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsOpen((v) => !v);
                    }
                }}
            >
                {children}
            </div>

            {mounted ? createPortal(menuContent, document.body) : null}
        </div>
    );
};
