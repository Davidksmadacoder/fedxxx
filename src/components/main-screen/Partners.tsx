"use client";

import React from "react";
import Image from "next/image";
import SlideFadeContainer from "../features/SlideFadeContainer";

type Partner = {
    name: string;
    logo: string;
    width?: number;
    height?: number;
};

const Partners: React.FC = () => {
    const partners: Partner[] = [
        { name: "GIGABYTE", logo: "/images/gigabyte.png", width: 220, height: 80 },
        { name: "TEXAS", logo: "/images/texas.png", width: 200, height: 80 },
        { name: "Tangem", logo: "/images/tangem.png", width: 200, height: 80 },
        { name: "SF Express", logo: "/images/sf.png", width: 180, height: 80 },
        { name: "Amazon", logo: "/images/amazon.png", width: 200, height: 80 },
        { name: "Go Pass", logo: "/images/gopass.png", width: 200, height: 80 },
    ];

    return (
        <section className="relative py-14 bg-white dark:bg-gray-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(var(--bg-general)_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <SlideFadeContainer direction="top" delay={0.1}>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Partners
                        </h2>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.2}>
                        <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Our Trusted Collaborators
                        </h3>
                    </SlideFadeContainer>
                </div>

                {/* Partners Grid */}
                <SlideFadeContainer direction="bottom" delay={0.25}>
                    <ul
                        className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
                        aria-label="Partner logos"
                    >
                        {partners.map((p, i) => (
                            <li key={p.name}>
                                <div
                                    className="group relative h-full w-full rounded-md border border-gray-200/80 dark:border-gray-700/70 bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 sm:p-7 flex items-center justify-center overflow-hidden
                             transition-all duration-500 hover:shadow-md hover:border-[var(--bg-general)]"
                                    aria-label={p.name}
                                    title={p.name}
                                >

                                    {/* Logo wrapper ensures consistent sizing */}
                                    <div
                                        className="relative w-full max-w-[220px] aspect-[3/1] sm:aspect-[5/2] flex items-center justify-center"
                                    >
                                        <Image
                                            src={p.logo}
                                            alt={`${p.name} logo`}
                                            width={p.width ?? 220}
                                            height={p.height ?? 80}
                                            loading="lazy"
                                            sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 220px"
                                        />
                                    </div>

                                    {/* Top-right glow dot */}
                                    <span className="pointer-events-none absolute -top-2 -right-2 size-14 rounded-full bg-[var(--bg-general)]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Screen-reader fallback */}
                                    <span className="sr-only">{p.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </SlideFadeContainer>

                {/* Trust Badge */}
                <SlideFadeContainer direction="bottom" delay={0.45}>
                    <div className="text-center mt-16">
                        <div className="inline-flex items-center gap-4 bg-gray-100/70 dark:bg-gray-800/70 px-8 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 bg-[var(--bg-general)] rounded-full animate-pulse"
                                            style={{ animationDelay: `${i * 0.18}s` }}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                                    Trusted by industry leaders worldwide
                                </span>
                            </div>
                        </div>
                    </div>
                </SlideFadeContainer>
            </div>
        </section>
    );
};

export default Partners;
