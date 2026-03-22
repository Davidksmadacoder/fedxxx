"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@mantine/core";
import { MdOutlineArrowForward, MdOutlineLocalShipping } from "react-icons/md";
import SlideFadeContainer from '../features/SlideFadeContainer';
import { api } from "@/api/axios";
import Link from "next/link";
import CustomLoader from "../features/CustomLoader";

type Project = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    image: string;
    client?: string;
};

const Portfolio: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get("/project?active=true");
                setProjects(res.data.projects || []);
            } catch (error) {
                console.error("Failed to load projects");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(projects.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [projects]);

    const filteredProjects = useMemo(() => {
        if (selectedCategory === "All") return projects;
        return projects.filter(p => p.category === selectedCategory);
    }, [projects, selectedCategory]);

    return (
        <section className="relative py-20 lg:py-28 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0 bg-[radial-gradient(var(--bg-general)_1px,transparent_1px)] [background-size:24px_24px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
                    <div className="flex-1">
                        <SlideFadeContainer direction="top" delay={0.1}>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Latest Projects
                            </h2>
                        </SlideFadeContainer>
                        <SlideFadeContainer direction="top" delay={0.2}>
                            <h3 className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                                Explore Our Portfolio of Recent Achievements
                            </h3>
                        </SlideFadeContainer>
                    </div>
                    <SlideFadeContainer direction="top" delay={0.3}>
                        <div className="flex gap-4 mt-6 lg:mt-0">
                            <Button
                                rightSection={<MdOutlineArrowForward size={16} />}
                                color="brandOrange"
                                size="lg"
                                component={Link}
                                href="/projects"
                                className="font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                View All Projects
                            </Button>
                        </div>
                    </SlideFadeContainer>
                </div>

                <SlideFadeContainer direction="top" delay={0.3}>
                    <div className="flex flex-wrap gap-3 mb-12">
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                                    selectedCategory === category
                                        ? 'bg-[var(--bg-general)] text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[var(--bg-general-lighter)] hover:text-[var(--bg-general)]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </SlideFadeContainer>

                {loading ? (
                    <div className="py-20">
                        <CustomLoader loading={true} />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                        {filteredProjects.slice(0, 8).map((project, index) => (
                            <SlideFadeContainer key={project._id} direction="bottom" delay={0.2 + index * 0.15}>
                                <Link href={`/projects/${project.slug}`}>
                                    <div className="group bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:scale-105 cursor-pointer">
                                        <div className="relative h-48 bg-gradient-to-br from-[var(--bg-general-lighter)] to-blue-100 dark:to-gray-700 overflow-hidden">
                                            {project.image ? (
                                                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <MdOutlineLocalShipping size={48} className="text-[var(--bg-general)] opacity-50" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 dark:bg-gray-800/90 text-[var(--bg-general)] px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                                    {project.category}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-[var(--bg-general)] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[var(--bg-general)] transition-colors duration-300 line-clamp-2">
                                                {project.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--bg-general)] font-semibold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                                                    View Case Study
                                                    <MdOutlineArrowForward size={16} />
                                                </span>
                                                <div className="w-0 group-hover:w-8 h-0.5 bg-[var(--bg-general)] transition-all duration-300"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SlideFadeContainer>
                        ))}
                    </div>
                )}

                {filteredProjects.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400">No projects found in this category.</p>
                    </div>
                )}

                <SlideFadeContainer direction="bottom" delay={0.6}>
                    <div className="text-center mt-16">
                        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-2xl p-8 lg:p-10 text-white max-w-4xl mx-auto">
                            <h4 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Start Your Project?</h4>
                            <p className="text-orange-100 mb-6 text-lg max-w-2xl mx-auto">
                                Let's discuss how we can help streamline your logistics and supply chain operations.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" variant="white" color="dark" className="font-semibold" component={Link} href="/services/consultation">
                                    Get Free Consultation
                                </Button>
                                <Button size="lg" variant="outline" color="white" className="font-semibold border-2" component={Link} href="/projects">
                                    Browse All Projects
                                </Button>
                            </div>
                        </div>
                    </div>
                </SlideFadeContainer>
            </div>
        </section>
    );
};

export default Portfolio;
