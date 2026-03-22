"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@mantine/core";
import { MdOutlineArrowForward, MdOutlinePeople } from "react-icons/md";
import SlideFadeContainer from "../features/SlideFadeContainer";

const FALLBACK_IMAGE = "/images/team-placeholder.jpg";

function MemberPhoto({ src, alt }: { src?: string; alt: string }) {
    const initial = src?.trim() ? src : FALLBACK_IMAGE;
    const [imgSrc, setImgSrc] = useState(initial);

    return (
        <div className="relative w-full h-48 overflow-hidden rounded-xl mb-4 bg-gray-100 dark:bg-gray-700 ring-1 ring-black/5 dark:ring-white/10">
            <Image
                src={imgSrc}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                onError={() => {
                    if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
                }}
                priority={false}
            />
            {/* subtle overlay for readability + premium look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 to-black/0 pointer-events-none" />
        </div>
    );
}

const Team: React.FC = () => {
    const teamMembers = [
        {
            name: "David M. Lalan",
            position: "Supply Chain Manager",
            image: "/images/davidmlalan.jpg",
            description: "Expert in optimizing supply chain operations with 15+ years of experience.",
        },
        {
            name: "Sarah Johnson",
            position: "Operations Director",
            image: "/images/sarahjohnson.jpg", // add this file OR it will show fallback
            description: "Leads our global operations with precision and strategic vision.",
        },
        {
            name: "Michael Chen",
            position: "Logistics Coordinator",
            image: "/images/michaelchen.jpg", // add this file OR it will show fallback
            description: "Ensures seamless coordination across all transportation modes.",
        },
        {
            name: "Emily Rodriguez",
            position: "Customer Success Manager",
            image: "/images/emilyrodriguez.jpg", // add this file OR it will show fallback
            description: "Dedicated to delivering exceptional service and building lasting relationships.",
        },
    ];

    const stats = [
        { number: "300+", label: "Creative team members" },
        { number: "25+", label: "Years of experience" },
        { number: "50+", label: "Industry experts" },
        { number: "24/7", label: "Team support" },
    ];

    return (
        <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--bg-general-lighter)] rounded-full -translate-y-40 translate-x-40 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--bg-general-lighter)] rounded-full -translate-x-32 translate-y-32 opacity-30"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <SlideFadeContainer direction="top" delay={0.1}>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Team
                        </h2>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.2}>
                        <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
                            Meet Our Dedicated Team
                        </h3>
                    </SlideFadeContainer>

                    <SlideFadeContainer direction="top" delay={0.3}>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                            Get to know the individuals who work tirelessly behind the scenes to ensure that we deliver top-notch service to our clients.
                        </p>
                    </SlideFadeContainer>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {teamMembers.map((member, index) => (
                            <SlideFadeContainer key={member.name} direction="left" delay={0.2 + index * 0.1}>
                                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:scale-105">
                                    {/* ✅ REAL IMAGE (no initials block) */}
                                    <MemberPhoto src={member.image} alt={`${member.name} portrait`} />

                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[var(--bg-general)] transition-colors duration-300">
                                        {member.name}
                                    </h4>

                                    <p className="text-[var(--bg-general)] font-semibold text-sm mb-3">
                                        {member.position}
                                    </p>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        {member.description}
                                    </p>

                                    <div className="w-0 group-hover:w-12 h-0.5 bg-[var(--bg-general)] mt-4 transition-all duration-300"></div>
                                </div>
                            </SlideFadeContainer>
                        ))}
                    </div>

                    {/* ...your Stats & CTA section stays the same... */}
                    <div className="space-y-8">
                        <SlideFadeContainer direction="right" delay={0.3}>
                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                                    >
                                        <div className="text-2xl lg:text-3xl font-bold text-[var(--bg-general)] mb-2 group-hover:scale-110 transition-transform duration-300">
                                            {stat.number}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {stat.label}
                                        </div>
                                        <div className="w-0 group-hover:w-8 h-0.5 bg-[var(--bg-general)] mt-3 mx-auto transition-all duration-300"></div>
                                    </div>
                                ))}
                            </div>
                        </SlideFadeContainer>

                        <SlideFadeContainer direction="right" delay={0.5}>
                            <div className="bg-gradient-to-r from-[var(--bg-general)] to-orange-600 rounded-2xl p-8 text-white">
                                <div className="flex items-start gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
                                        <MdOutlinePeople size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold mb-2">Join Our Team</h4>
                                        <p className="text-orange-100 mb-6 text-sm">
                                            Be part of our innovative team and help shape the future of logistics.
                                        </p>
                                        <Button
                                            rightSection={<MdOutlineArrowForward size={16} />}
                                            variant="white"
                                            color="dark"
                                            size="md"
                                            className="font-semibold hover:scale-105 transition-transform duration-300"
                                        >
                                            View Open Positions
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </SlideFadeContainer>

                        <SlideFadeContainer direction="right" delay={0.6}>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <h5 className="font-bold text-gray-900 dark:text-white mb-3">
                                    Why Work With Us?
                                </h5>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[var(--bg-general)] rounded-full"></div>
                                        Competitive salary & benefits
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[var(--bg-general)] rounded-full"></div>
                                        Professional development opportunities
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[var(--bg-general)] rounded-full"></div>
                                        Innovative work environment
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[var(--bg-general)] rounded-full"></div>
                                        Global career opportunities
                                    </li>
                                </ul>
                            </div>
                        </SlideFadeContainer>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Team;
