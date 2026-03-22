"use client";

import React, { useState, useEffect, useRef } from "react";

interface CollapseProps {
    children: React.ReactNode;
    in: boolean;
    className?: string;
}

export const Collapse: React.FC<CollapseProps> = ({ children, in: isOpen, className = "" }) => {
    const [height, setHeight] = useState<number | "auto">(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen, children]);

    return (
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${className}`}
            style={{ height: typeof height === "number" ? `${height}px` : height }}
        >
            <div ref={contentRef}>{children}</div>
        </div>
    );
};



