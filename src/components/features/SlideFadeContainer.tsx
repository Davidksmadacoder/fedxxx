"use client";

import { motion, MotionProps } from "framer-motion";
import React from "react";

interface SlideFadeContainerProps extends MotionProps {
    children: React.ReactNode;
    direction?: "top" | "bottom" | "left" | "right";
    distance?: number;
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;

    mode?: "inView" | "controlled";
    active?: boolean;
    keepMounted?: boolean;
    initialState?: "hidden" | "visible";
}

const getVariants = (
    direction: "top" | "bottom" | "left" | "right",
    distance: number
) => ({
    hidden: {
        opacity: 0,
        x: direction === "left" ? -distance : direction === "right" ? distance : 0,
        y: direction === "top" ? -distance : direction === "bottom" ? distance : 0,
        pointerEvents: "none" as const,
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        pointerEvents: "auto" as const,
    },
});

const SlideFadeContainer: React.FC<SlideFadeContainerProps> = ({
    children,
    direction = "top",
    distance = 50,
    delay = 0,
    duration = 0.5,
    className,
    once = true,
    mode = "inView",
    active = true,
    keepMounted = true,
    initialState = "hidden",
    ...motionProps
}) => {
    const variants = getVariants(direction, distance);

    if (mode === "controlled") {
        return (
            <motion.div
                initial={initialState}
                animate={active ? "visible" : "hidden"}
                transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
                variants={variants}
                className={className}
                style={keepMounted ? undefined : { display: active ? undefined : "none" }}
                {...motionProps}
            >
                {children}
            </motion.div>
        );
    }

    // Default behavior (backwards compatible with your app)
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once }}
            transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
            variants={variants}
            className={className}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
};

export default SlideFadeContainer;
